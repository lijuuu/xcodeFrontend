// src/slices/xCodeSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { File, Response } from '@/pages/Compiler/compiler-main';

// Define state type
interface XCodeState {
  code: string;
  language: string;
  loading: boolean;
  file: string;
  result: Response;
  files: File[];
  currentFile: string | null;
  isRenaming: boolean;
  newFileName: string;
  fileToRename: string | null;
}

// Initial state
const initialState: XCodeState = {
  code: '',
  language: 'javascript',
  loading: false,
  file: 'js',
  result: { output: '', status_message: '', success: false },
  files: [],
  currentFile: null,
  isRenaming: false,
  newFileName: '',
  fileToRename: null,
};

// Async thunk for running code
export const runCode = createAsyncThunk(
  'xCode/runCode',
  async (
    { code, reqLang }: { code: string; reqLang: string },
    { rejectWithValue }
  ) => {
    const environment = import.meta.env.VITE_ENVIRONMENT;
    const apiUrl =
      environment === 'DEVELOPMENT'
        ? import.meta.env.VITE_XENGINELOCALURL
        : import.meta.env.VITE_XENGINEPRODUCTIONURL;

    if (!reqLang) {
      console.log('No language selected');
      return rejectWithValue({ output: '', status_message: 'No language selected', success: false });
    }

    try {
      const response = await axios.post(
        apiUrl,
        { code: btoa(code), language: reqLang },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const responseData = response.data as Response;

      if (!responseData.success) {
        return {
          output: responseData.output,
          status_message: responseData.error || 'An error occurred.',
          success: false,
          execution_time: responseData.execution_time,
        };
      }
      return {
        output: responseData.output,
        status_message: responseData.status_message,
        success: true,
        execution_time: responseData.execution_time,
      };
    } catch (error: any) {
      console.error('Error during request:', error);
      return rejectWithValue({
        output: error.response?.data?.output || '',
        status_message: error.response?.data?.error || 'An error occurred during execution.',
        success: false,
      });
    }
  }
);

// The slice
const xCodeSlice = createSlice({
  name: 'xCode',
  initialState,
  reducers: {
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setResult: (state, action: PayloadAction<Response>) => {
      state.result = action.payload;
    },
    setFiles: (state, action: PayloadAction<File[]>) => {
      state.files = action.payload;
    },
    setFile: (state, action: PayloadAction<string>) => {
      state.file = action.payload;
    },
    setCurrentFile: (state, action: PayloadAction<string | null>) => {
      state.currentFile = action.payload;
    },
    setRenaming: (state, action: PayloadAction<boolean>) => {
      state.isRenaming = action.payload;
    },
    setNewFileName: (state, action: PayloadAction<string>) => {
      state.newFileName = action.payload;
    },
    setFileToRename: (state, action: PayloadAction<string | null>) => {
      state.fileToRename = action.payload;
    },
    saveCurrentFile: (
      state,
      action: PayloadAction<{ currentFile: string; code: string }>
    ) => {
      const { currentFile, code } = action.payload;
      if (!currentFile) return;
      state.files = state.files.map((file) =>
        file.id === currentFile
          ? { ...file, content: code, lastModified: new Date().toISOString() }
          : file
      );
      localStorage.setItem('xcode-files', JSON.stringify(state.files));
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(runCode.pending, (state) => {
        state.loading = true;
        state.result = { output: '', status_message: '', success: false };
      })
      .addCase(runCode.fulfilled, (state, action) => {
        state.loading = false;
        state.result = action.payload;
      })
      .addCase(runCode.rejected, (state, action) => {
        state.loading = false;
        state.result = action.payload as Response;
      });
  },
});

// Export actions
export const {
  setCode,
  setLanguage,
  setLoading,
  setResult,
  setFiles,
  setFile,
  setCurrentFile,
  setRenaming,
  setNewFileName,
  setFileToRename,
  saveCurrentFile,
} = xCodeSlice.actions;

export default xCodeSlice.reducer;