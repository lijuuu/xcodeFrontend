import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';
import Cookies from 'js-cookie';

// Base URL for your API
const API_BASE_URL = 'http://localhost:7000/api/v1';

// Types based on Go backend models
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
  socials: {
    github: string;
    twitter: string;
    linkedin: string;
  };
  createdAt: number;
}

interface BanHistory {
  id: string;
  userID: string;
  bannedAt: number;
  banType: string;
  banReason: string;
  banExpiry: number;
}

interface GenericResponse<T> {
  success: boolean;
  status: number;
  payload: T;
  error?: {
    code: number;
    message: string;
    details?: string;
  };
}

// State interface for the admin slice
interface AdminState {
  users: UserProfile[];
  totalUsers: number;
  nextPageToken: string;
  banHistories: { [userID: string]: BanHistory[] };
  loading: boolean;
  error: string | null;
  message: string;
  isAuthenticated: boolean; // Added for login state
  accessToken: string | null; // Added for token storage
  refreshToken: string | null; // Added for refresh token
  adminID: string | null; // Added for admin ID
  expiresIn: number | null; // Added for token expiration
}

const initialState: AdminState = {
  users: [],
  totalUsers: 0,
  nextPageToken: '',
  banHistories: {},
  loading: false,
  error: null,
  message: '',
  isAuthenticated: false,
  accessToken: null,
  refreshToken: null,
  adminID: null,
  expiresIn: null,
};

// Async Thunks
export const loginAdmin = createAsyncThunk<
  { accessToken: string; refreshToken: string; expiresIn: number; adminID: string; message: string },
  { email: string; password: string },
  { rejectValue: string }
>('admin/login', async ({ email, password }, { rejectWithValue }) => {
  try {
    const response = await axios.post<GenericResponse<any>>(
      `${API_BASE_URL}/admin/login`,
      { email, password },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const payload = response.data.payload;
    Cookies.set('accessToken', payload.accessToken, { expires: payload.expiresIn / 86400 }); // Convert seconds to days
    Cookies.set('refreshToken', payload.refreshToken);
    return {
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      expiresIn: payload.expiresIn,
      adminID: payload.adminID,
      message: payload.message,
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to login');
  }
});

// Fetch all users (unchanged for brevity, but typed correctly)
export const getAllUsers = createAsyncThunk<
  { users: UserProfile[]; totalCount: number; nextPageToken: string },
  void,
  { rejectValue: string }
>('admin/getAllUsers', async (_, { rejectWithValue }) => {
  try {
    const response = await axios.get<GenericResponse<any>>(`${API_BASE_URL}/admin/users`, {
      headers: { Authorization: `Bearer ${Cookies.get('accessToken')}` },
    });
    const payload = response.data.payload;
    return {
      users: payload.users,
      totalCount: payload.totalCount,
      nextPageToken: payload.nextPageToken,
    };
  } catch (error: any) {
    return rejectWithValue(error.response?.data?.error?.message || 'Failed to fetch users');
  }
});

// Other thunks (banUser, unbanUser, etc.) remain unchanged for brevity

// Admin Slice
const adminSlice = createSlice({
  name: 'admin',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    logout: (state) => {
      state.isAuthenticated = false;
      state.accessToken = null;
      state.refreshToken = null;
      state.adminID = null;
      state.expiresIn = null;
      state.message = '';
      Cookies.remove('accessToken');
      Cookies.remove('refreshToken');
    },
  },
  extraReducers: (builder) => {
    // Login Admin
    builder
      .addCase(loginAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.message = '';
      })
      .addCase(loginAdmin.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.accessToken = action.payload.accessToken;
        state.refreshToken = action.payload.refreshToken;
        state.adminID = action.payload.adminID;
        state.expiresIn = action.payload.expiresIn;
        state.message = action.payload.message;
      })
      .addCase(loginAdmin.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to login';
        state.message = '';
      });

    // Get All Users
    builder
      .addCase(getAllUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.users;
        state.totalUsers = action.payload.totalCount;
        state.nextPageToken = action.payload.nextPageToken;
      })
      .addCase(getAllUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Failed to fetch users';
      });

    // Other cases (banUser, unbanUser, etc.) remain unchanged
  },
});

export const { clearError, logout } = adminSlice.actions;
export default adminSlice.reducer;