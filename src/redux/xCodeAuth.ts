import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import ROUTES from '@/routeconst'; 

// Define state type
interface AuthState {
  user: any;
  loading: boolean;
  error: string | null;
}

interface User{
  id: string;
  username: string;
  email: string;
  role: string;
  createdAt: string;
  updatedAt: string;
}

// Initial state
const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

/**
 * Async thunk for user login.
 * @param credentials - The user's login credentials.
 * @returns The user data on successful login.
 */
export const loginUser = createAsyncThunk( 
  'auth/login',
  async (credentials: { email: string; password: string }, { rejectWithValue }) => {
    try {
      const response = await axios.post(ROUTES.LOGIN, credentials);
      return response.data; // Assuming the response contains user data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Login failed');
    }
  }
);

/**
 * Async thunk for user registration.
 * @param userData - The data required for user registration.
 * @returns The user data on successful registration.
 */
export const registerUser = createAsyncThunk(
  'auth/register',
  async (userData: any, { rejectWithValue }) => {
    try {
      const response = await axios.post(ROUTES.REGISTER, userData);
      return response.data; // Assuming the response contains user data
    } catch (error: any) {
      return rejectWithValue(error.response?.data || 'Registration failed');
    }
  }
);

// The slice
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    /**
     * Action to log out the user.
     * Clears user data from the state. 
     */
    logout: (state) => {
      state.user = null; // Clear user data on logout
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload; // Set user data on successful login
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Set error message on failed login
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<any>) => {
        state.loading = false;
        state.user = action.payload; // Set user data on successful registration
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string; // Set error message on failed registration
      });
  },
});

// Export actions
export const { logout } = authSlice.actions;

export default authSlice.reducer;