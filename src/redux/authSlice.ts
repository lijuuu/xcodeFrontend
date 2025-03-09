import axiosInstance from "@/utils/axiosInstance";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import Cookies from "js-cookie";

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
  payload: LoginUserResponse | UserProfile;
}

interface AuthState {
  userId: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: { message: string; code?: number } | null;
  accessToken: string | null;
  refreshToken: string | null;
  successMessage: string | null;
  userProfile: UserProfile | null;
  lastResendTimestamp: number | null;
  resendCooldown: boolean;
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

const initialState: AuthState = {
  userId: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  successMessage: null,
  accessToken: null,
  refreshToken: null,
  userProfile: null,
  lastResendTimestamp: null,
  resendCooldown: false,
  ...loadState(),
};

export const registerUser = createAsyncThunk<
  { success: boolean; status: number; payload: { userID: string; message: string } },
  { firstName: string; lastName: string; email: string; password: string; confirmPassword: string },
  { rejectValue: { message: string } }
>("auth/registerUser", async (userData, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.post("/auth/register", userData);
    return response.data;
  } catch (error: any) {
    return rejectWithValue({ message: error.response?.data?.error?.message || "Registration failed" });
  }
});

export const resendEmail = createAsyncThunk<
  { success: boolean; status: number; payload: { message: string } },
  { email: string },
  { rejectValue: { message: string } }
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
    return rejectWithValue({
      message: error.response?.data?.error?.message || "Failed to resend email verification",
    });
  }
});

export const getUser = createAsyncThunk<
  ApiResponse,
  void,
  { rejectValue: { message: string } }
>("auth/getUser", async (_, { rejectWithValue }) => {
  try {
    const response = await axiosInstance.get("/users/profile");
    console.log("Get User Response", response.data);
    return response.data as ApiResponse;
  } catch (error: any) {
    console.error("Get User Error:", error);
    Cookies.remove("accessToken");
    Cookies.remove("refreshToken");
    return rejectWithValue({ message: error.response?.data?.error?.message || "Failed to get user" });
  }
});
export const loginUser = (credentials: { email: string; password: string }) => async (dispatch: any): Promise<void> => {
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

    // Add a 1.5-second delay before dispatching loginSuccess
    setTimeout(() => {
      dispatch(loginSuccess(data));
      dispatch(setAuthLoading(false)); // Reset loading after the delay
    }, 1500); // 1500ms = 1.5 seconds
  } catch (error: any) {
    const errorResponse = error.response?.data;
    dispatch(
      loginFailure({
        message: errorResponse?.error?.message || error.message || "Login failed",
        code: error.response?.status || 500,
      })
    );
    dispatch(setAuthLoading(false)); // Reset loading on error
  }
  // Remove the finally block since loading is handled in the setTimeout and catch
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
      state.error = null;
      state.successMessage = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.userProfile = null;
      state.lastResendTimestamp = null;
      state.resendCooldown = false;
      Cookies.remove("accessToken");
      Cookies.remove("refreshToken");
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
      state.isAuthenticated = action.payload.userProfile?.isVerified ?? false;
      state.successMessage = action.payload.message;
      state.error = null;
    },
    loginFailure: (state, action: PayloadAction<{ message: string; code?: number }>) => {
      console.log("Login Failure", action.payload);
      state.loading = false;
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
          action: PayloadAction<{ success: boolean; status: number; payload: { userID: string; message: string } }>
        ) => {
          state.loading = false;
          state.userId = action.payload.payload.userID;
          state.successMessage = action.payload.payload.message;
          state.isAuthenticated = false;
        }
      )
      .addCase(registerUser.rejected, (state, action: PayloadAction<{ message: string } | undefined>) => {
        state.loading = false;
        state.error = action.payload ? { message: action.payload.message } : { message: "Unknown error" };
      })
      .addCase(resendEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(
        resendEmail.fulfilled,
        (state, action: PayloadAction<{ success: boolean; status: number; payload: { message: string } }>) => {
          state.loading = false;
          state.successMessage = action.payload.payload.message;
          state.lastResendTimestamp = Date.now();
          state.resendCooldown = true;
        }
      )
      .addCase(resendEmail.rejected, (state, action: PayloadAction<{ message: string } | undefined>) => {
        state.loading = false;
        state.error = action.payload ? { message: action.payload.message } : { message: "Unknown error" };
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
          state.isAuthenticated = userProfile.isVerified ?? false;
          state.successMessage = "User profile fetched successfully";
          state.error = null;
        } else {
          state.error = { message: "Invalid response from getUser" };
        }
      })
      .addCase(getUser.rejected, (state, action: PayloadAction<{ message: string } | undefined>) => {
        state.loading = false;
        state.error = action.payload ? { message: action.payload.message } : { message: "Unknown error" };
        Cookies.remove("accessToken");
        Cookies.remove("refreshToken");
        state.isAuthenticated = false;
        state.userProfile = null;
        state.userId = null;
      });
  },
});

export const { setAuthLoading, clearAuthState, clearMessages, updateResendCooldown, loginSuccess, loginFailure } =
  authSlice.actions;
export default authSlice.reducer;


export type { UserProfile };