import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import ROUTES from '@/routeconst';
import Cookies from 'js-cookie';

// Define the response types
interface GenericResponse<T> {
  success: boolean;
  status: number;
  payload?: T;
  error?: ErrorInfo;
}

interface ErrorInfo {
  code?: number;
  message?: string;
  details?: string;
}

interface LoginUserResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  userID: string;
  userProfile: User;
  message?: string;
}

// Define state type
interface AuthState {
  user: User | null;
  loading: boolean;
  success: boolean;
  error: ErrorInfo | null;
  tokens?: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

interface User {
  UserID: string;
  UserName: string;
  FirstName: string;
  LastName: string;
  AvatarURL: string;
  Email: string;
  Role: string;
  Status: string;
  Country: string;
  IsBanned: boolean;
  IsVerified: boolean;
  PrimaryLanguageID: string;
  MuteNotifications: boolean;
  Socials: {
    Github: string;
    Twitter: string;
    Linkedin: string;
  };
  CreatedAt: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  success: false,
};
export const getUser = createAsyncThunk(
  'xcodeAuth/getUser',
  async (_, { rejectWithValue }) => {
    const accessToken = Cookies.get('accessToken');
    if (!accessToken) {
      return rejectWithValue({ message: 'Access token not found in cookies' });
    }

    const userID = localStorage.getItem("userID");
    if (!userID) {
      return rejectWithValue({ message: 'User ID not found in localStorage' });
    }

    const response = await axios.get(`${ROUTES.BASEURLDEVELOPMENT}${ROUTES.PROFILE}?userID=${userID}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    return response.data;
  }
);

export const loginUser = createAsyncThunk(
  'xcodeAuth/login',
  async (credentials: any, { rejectWithValue }) => {
    try {
      console.log('Login: Attempting with:', credentials.email);
      const response: any = await axios.post(
        ROUTES.BASEURLDEVELOPMENT + ROUTES.LOGIN,
        credentials
      );
      console.log('Login: Response:', response.data);

      if (!response.data.success) {
        return rejectWithValue(response.data.error);
      }

      const { payload } = response.data;

      // Set access token with 7 days expiry
      Cookies.set('accessToken', payload.accessToken, {
        expires: 7,
        secure: true,
        sameSite: 'strict'
      });

      // Set refresh token with 30 days expiry
      Cookies.set('refreshToken', payload.refreshToken, {
        expires: 30,
        secure: true,
        sameSite: 'strict'
      });

      // Store user data in localStorage
      localStorage.setItem("userID", payload.userID)
      localStorage.setItem('user', JSON.stringify({
        userID: payload.userID,
        email: payload.userProfile.email,
        firstName: payload.userProfile.firstName,
        lastName: payload.userProfile.lastName,
        role: payload.userProfile.role,
        isVerified: payload.userProfile.isVerified
      }));

      return response.data;
    } catch (error: any) {
      console.error('Login: Error:', error.response || error);
      return rejectWithValue({
        details: error.response?.data?.error?.details,
        code: error.response?.status || 500,
        message: error.response?.data?.error?.message || 'An error occurred'
      });
    }
  }
);

export const registerUser = createAsyncThunk(
  'xcodeAuth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(ROUTES.BASEURLDEVELOPMENT + ROUTES.REGISTER, userData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data.error);
    }
  }
);

export const resendEmail = createAsyncThunk(
  'xcodeAuth/resendEmail',
  async (email: string, { rejectWithValue }) => {
    try {
      const response: any = await axios.get(
        ROUTES.BASEURLDEVELOPMENT + ROUTES.OTP_RESEND + `?email=${email}`
      );

      if (!response.data.success) {
        return rejectWithValue(response.data.error);
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue({
        details: error.response?.data?.error?.details,
        code: error.response?.status || 500,
        message: error.response?.data?.error || 'Failed to send verification email'
      });
    }
  }
);

// Add logout cleanup
export const logout = createAsyncThunk(
  'xcodeAuth/logout',
  async (_, { dispatch }) => {
    // Clear cookies
    Cookies.remove('accessToken');
    Cookies.remove('refreshToken');

    // Clear localStorage
    localStorage.removeItem('user');

    // Clear Redux state
    dispatch(clearAuthInitialState());
  }
);

// The slice
const authSlice = createSlice({
  name: 'xcodeAuth',
  initialState,
  reducers: {
    clearAuthInitialState: (state) => {
      state.user = null;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Login User
      .addCase(loginUser.pending, (state) => {
        state.user = null;
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        const { payload } = action.payload as any;
        if (payload) {
          state.user = payload.userProfile;
          state.tokens = {
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
            expiresIn: payload.expiresIn,
          };
        }
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.user = action.payload as User;
        state.loading = false;
        state.error = action.payload as ErrorInfo;
      })

      // Register User
      .addCase(registerUser.pending, (state) => {
        state.user = null;
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.user = action.payload as User;
        state.loading = false;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.user = action.payload as User;
        state.loading = false;
        state.error = action.payload as ErrorInfo;
      })

      //Resend Email
      .addCase(resendEmail.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(resendEmail.fulfilled, (state, action) => {
        state.loading = false;
        state.success = true;
        state.error = null;
      })
      .addCase(resendEmail.rejected, (state, action) => {
        state.loading = false;
        state.success = false;
        state.error = action.payload as ErrorInfo;
      })


      //Get User
      .addCase(getUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload as User;
      })
  },
});

// Export actions
export const { clearAuthInitialState } = authSlice.actions;

export default authSlice.reducer;