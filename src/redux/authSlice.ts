import axiosInstance from "@/utils/axiosInstance";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { errorMessages } from "@/constants/errortypes";

interface Socials {
  twitter?: string;
  linkedin?: string;
  github?: string;
}

interface UserProfile {
  userID: string;
  userName: string;
  firstName: string;
  lastName: string;
  avatarURL: string;
  email: string;
  role: string;
  country: string;
  isBanned: boolean;
  isVerified: boolean;
  primaryLanguageID: string;
  muteNotifications: boolean;
  socials: Socials;
  createdAt: number;
}

interface LoginUserResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userID: string;
  userProfile: UserProfile;
  message: string;
}

interface ApiResponse {
  success: boolean;
  status: number;
  payload: LoginUserResponse | UserProfile | { message: string; expiryAt?: number } | { message: string };
}

interface AuthState {
  userId: string | null;
  isAuthenticated: boolean;
  email: string | null;
  loading: boolean;
  error: { message: string; code?: number; type?: string } | null;
  accessToken: string | null;
  refreshToken: string | null;
  successMessage: string | null;
  userProfile: UserProfile | null;
  lastResendTimestamp: number | null;
  resendCooldown: boolean;
  expiryAt: number | null;
}

const loadState = (): Partial<AuthState> => {
  try {
    const serializedState = localStorage.getItem("auth");
    if (serializedState === null) return {};
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Failed to load state from localStorage", err);
    return {};
  }
};

const saveState = (state: AuthState) => {
  try {
    const serializedState = JSON.stringify({
      userId: state.userId,
      isAuthenticated: state.isAuthenticated,
      email: state.email,
      userProfile: state.userProfile,
      lastResendTimestamp: state.lastResendTimestamp,
      resendCooldown: state.resendCooldown,
      expiryAt: state.expiryAt,
    });
    localStorage.setItem("auth", serializedState);
  } catch (err) {
    console.error("Failed to save state to localStorage", err);
  }
};

const initialState: AuthState = {
  userId: null,
  isAuthenticated: false,
  email: null,
  loading: false,
  error: null,
  successMessage: null,
  accessToken: null,
  refreshToken: null,
  userProfile: null,
  lastResendTimestamp: null,
  resendCooldown: false,
  expiryAt: null,
  ...loadState(),
};

export const registerUser = createAsyncThunk<
  { success: boolean; status: number; payload: { userID: string; message: string; email: string } },
  { firstName: string; lastName: string; email: string; password: string; confirmPassword: string },
  { rejectValue: { type: string; message: string; code?: number } }
>("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  } catch (error: any) {
    const type = error.response?.data?.error?.type || "ERR_REG_CREATION_FAILED";
    const message = errorMessages[type as keyof typeof errorMessages] || error.response?.data?.error?.message || "Registration failed";
    return rejectWithValue({
      type,
      message,
      code: error.response?.status,
    });
  }
});

export const resendEmail = createAsyncThunk<
  { success: boolean; status: number; payload: { message: string; expiryAt: number } },
  { email: string },
  { rejectValue: { type?: string; message: string; code?: number } }
>("auth/resendEmail", async ({ email }, { rejectWithValue, getState }) => {
  const state = getState() as { auth: AuthState };
  const lastResend = state.auth.lastResendTimestamp;
  const currentTime = Date.now();
  const cooldownPeriod = 60 * 1000;

  if (lastResend && currentTime - lastResend < cooldownPeriod) {
    return rejectWithValue({
      message: `Please wait ${Math.ceil((cooldownPeriod - (currentTime - lastResend)) / 1000)} seconds before resending.`,
    });
  }

  try {
    const response = await axiosInstance.get("/auth/verify/resend", { params: { email } });
    return response.data;
  } catch (error: any) {
    const type = error.response?.data?.error?.type || "ERR_EMAIL_RESEND_FAILED";
    const message = errorMessages[type as keyof typeof errorMessages] || error.response?.data?.error?.message || "Failed to resend email verification";
    return rejectWithValue({
      type,
      message,
      code: error.response?.status,
    });
  }
});

export const verifyEmail = createAsyncThunk<
  { success: boolean; status: number; payload: { message: string } },
  { email: string; token: string },
  { rejectValue: { type?: string; message: string; code?: number } }
>("auth/verifyEmail", async ({ email, token }, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/auth/verify", {
      params: { email, token },
    });
    return response.data;
  } catch (error: any) {
    const type = error.response?.data?.error?.type || "ERR_VERIFY_TOKEN_INVALID";
    const message = errorMessages[type as keyof typeof errorMessages] || error.response?.data?.error?.message || "Email verification failed";
    return rejectWithValue({
      type,
      message,
      code: error.response?.status,
    });
  }
});

export const getUser = createAsyncThunk<
  ApiResponse,
  void,
  { rejectValue: { type?: string; message: string; code?: number } }
>("auth/getUser", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/users/profile");
    console.log("Get User Response", response.data);
    return response.data as ApiResponse;
  } catch (error: any) {
    console.error("Get User Error:", error);
    const type = error.response?.data?.error?.type || "ERR_PROFILE_NOT_FOUND";
    const message = errorMessages[type as keyof typeof errorMessages] || error.response?.data?.error?.message || "Failed to get user";
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    return rejectWithValue({
      type,
      message,
      code: error.response?.status,
    });
  }
});

export const updateProfileImage = createAsyncThunk<
  { success: boolean; status: number; payload: { message: string; avatarURL: string } },
  { avatarURL: string },
  { rejectValue: { type?: string; message: string; code?: number } }
>("auth/updateProfileImage", async ({ avatarURL }, { rejectWithValue, dispatch }) => {
  try {
    const response = await axiosInstance.patch("/users/profile/image", { avatarURL });
    dispatch(getUser());
    return response.data;
  } catch (error: any) {
    const type = error.response?.data?.error?.type || "ERR_PROFILE_IMAGE_UPDATE_FAILED";
    const message = errorMessages[type as keyof typeof errorMessages] || error.response?.data?.error?.message || "Failed to update profile image";
    return rejectWithValue({
      type,
      message,
      code: error.response?.status,
    });
  }
});

export const loginUser = (credentials: { email: string; password: string; code?: string }) => async (dispatch: any): Promise<void> => {
  dispatch(setAuthLoading(true));
  try {
    const response = await axiosInstance.post("/auth/login", credentials);
    const apiResponse = response.data as ApiResponse;

    if (!apiResponse.success || !apiResponse.payload) {
      throw new Error("Invalid login response");
    }

    const data = apiResponse.payload as LoginUserResponse;

    Cookies.set("accessToken", data.accessToken, {
      expires: data.expiresIn / (24 * 60 * 60),
      secure: true,
      sameSite: "Strict",
    });
    Cookies.set("refreshToken", data.refreshToken, { expires: 7, secure: true, sameSite: "Strict" });

    setTimeout(() => {
      dispatch(loginSuccess(data));
      dispatch(setAuthLoading(false));
    }, 1500);

  } catch (error: any) {
    const errorResponse = error.response?.data;
    const type = errorResponse?.error?.type || "ERR_LOGIN_CRED_WRONG";
    const message = errorMessages[type as keyof typeof errorMessages] || errorResponse?.error?.message || error.message || "Login failed";
    dispatch(
      loginFailure({
        message,
        code: errorResponse?.status || 500,
        type,
      })
    );
    dispatch(setAuthLoading(false));
  }
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAuthLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    clearAuthState: (state) => {
      state.userId = null;
      state.loading = false;
      state.isAuthenticated = false;
      state.email = null;
      state.error = null;
      state.successMessage = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.userProfile = null;
      state.lastResendTimestamp = null;
      state.resendCooldown = false;
      state.expiryAt = null;
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
      saveState(state);
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    },
    updateResendCooldown: (state) => {
      const currentTime = Date.now();
      const cooldownPeriod = 60 * 1000;
      if (state.lastResendTimestamp && currentTime - state.lastResendTimestamp < cooldownPeriod) {
        state.resendCooldown = true;
      } else {
        state.resendCooldown = false;
      }
    },
    loginSuccess: (state, action: PayloadAction<LoginUserResponse>) => {
      console.log("Login Success", action.payload);
      state.loading = false;
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.userId = action.payload.userID;
      state.userProfile = action.payload.userProfile;
      state.email = action.payload.userProfile.email;
      state.isAuthenticated = action.payload.userProfile?.isVerified ?? false;
      state.successMessage = action.payload.message;
      state.error = null;
      saveState(state);
    },
    loginFailure: (state, action: PayloadAction<{ message: string; code?: number; type?: string }>) => {
      console.log("Login Failure", action.payload);
      state.loading = false;
      state.email = state.email;
      state.error = action.payload;
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        registerUser.fulfilled,
        (
          state,
          action: PayloadAction<{ success: boolean; status: number; payload: { userID: string; message: string; email: string } }>
        ) => {
          state.loading = false;
          state.userId = action.payload.payload.userID;
          state.email = action.payload.payload.email;
          state.successMessage = action.payload.payload.message;
          state.isAuthenticated = false;
          saveState(state);
        }
      )
      .addCase(registerUser.rejected, (state, action: PayloadAction<{ type: string; message: string; code?: number } | undefined>) => {
        state.loading = false;
        state.error = action.payload || { type: "ERR_UNKNOWN", message: "Unknown error" };
      })
      .addCase(resendEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        resendEmail.fulfilled,
        (state, action: PayloadAction<{ success: boolean; status: number; payload: { message: string; expiryAt: number } }>) => {
          state.loading = false;
          state.successMessage = action.payload.payload.message;
          state.lastResendTimestamp = Date.now();
          state.resendCooldown = true;
          state.expiryAt = action.payload.payload.expiryAt;
          saveState(state);
        }
      )
      .addCase(resendEmail.rejected, (state, action: PayloadAction<{ type?: string; message: string; code?: number } | undefined>) => {
        state.loading = false;
        state.error = action.payload || { type: "ERR_UNKNOWN", message: "Unknown error" };
      })
      .addCase(verifyEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        verifyEmail.fulfilled,
        (state, action: PayloadAction<{ success: boolean; status: number; payload: { message: string } }>) => {
          state.loading = false;
          state.successMessage = action.payload.payload.message;
          state.isAuthenticated = true;
          // saveState(state);
        }
      )
      .addCase(verifyEmail.rejected, (state, action: PayloadAction<{ type?: string; message: string; code?: number } | undefined>) => {
        state.loading = false;
        state.error = action.payload || { type: "ERR_UNKNOWN", message: "Unknown error" };
      })
      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action: PayloadAction<ApiResponse>) => {
        console.log("Get User Fulfilled", action.payload);
        state.loading = false;
        if (action.payload.success && action.payload.payload) {
          const userProfile = action.payload.payload as UserProfile;
          state.userProfile = userProfile;
          state.userId = userProfile.userID;
          state.email = userProfile.email;
          state.isAuthenticated = userProfile.isVerified ?? false;
          state.successMessage = "User profile fetched successfully";
          state.error = null;
          saveState(state);
        } else {
          state.error = { type: "ERR_INVALID_RESPONSE", message: "Invalid response from getUser" };
        }
      })
      .addCase(getUser.rejected, (state, action: PayloadAction<{ type?: string; message: string; code?: number } | undefined>) => {
        state.loading = false;
        state.error = action.payload || { type: "ERR_UNKNOWN", message: "Unknown error" };
        state.isAuthenticated = false;
        state.userProfile = null;
        state.userId = null;
        state.email = null;
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        saveState(state);
      })
      .addCase(updateProfileImage.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        updateProfileImage.fulfilled,
        (state, action: PayloadAction<{ success: boolean; status: number; payload: { message: string; avatarURL: string } }>) => {
          state.loading = false;
          state.successMessage = action.payload.payload.message;
          if (state.userProfile) {
            state.userProfile.avatarURL = action.payload.payload.avatarURL;
          }
          saveState(state);
        }
      )
      .addCase(updateProfileImage.rejected, (state, action: PayloadAction<{ type?: string; message: string; code?: number } | undefined>) => {
        state.loading = false;
        state.error = action.payload || { type: "ERR_UNKNOWN", message: "Unknown error" };
      });
  },
});

export const { setAuthLoading, clearAuthState, clearMessages, updateResendCooldown, loginSuccess, loginFailure } =
  authSlice.actions;
export default authSlice.reducer;

export type { UserProfile };