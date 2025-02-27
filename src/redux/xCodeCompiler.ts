import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import axios from 'axios';
import { File, Response } from '@/pages/CompilerPage/CompilerPage';

// Define state type
interface XCodeState {
  code: string; // The code to be executed
  language: string; // The programming language of the code
  loading: boolean; // Loading state for async operations
  file: string; // The current file type (e.g., 'js', 'py')
  result: Response; // The result of the code execution
  files: File[]; // List of files in the editor
  currentFile: string | null; // ID of the currently active file
  isRenaming: boolean; // State to check if a file is being renamed
  newFileName: string; // New name for the file being renamed
  fileToRename: string | null; // ID of the file to rename
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

/**
 * Async thunk for running code.
 * @param {Object} param0 - The parameters for the thunk.
 * @param {string} param0.code - The code to execute.
 * @param {string} param0.reqLang - The requested programming language.
 * @returns {Promise<Response>} The result of the code execution.
 */
export const runCode = createAsyncThunk(
  'xCodeCompiler/runCode',
  async (
    { code, reqLang }: { code: string; reqLang: string },
    { rejectWithValue }
  ) => {
    const environment = import.meta.env.VITE_ENVIRONMENT;
    const apiUrl =
      environment === 'DEVELOPMENT'
        ? import.meta.env.VITE_XENGINELOCALENGINEURL
        : import.meta.env.VITE_XENGINEPRODUCTIONENGINEURL;

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
const xCodeCompilerSlice = createSlice({
  name: 'xCodeCompiler',
  initialState,
  reducers: {
    /**
     * Set the code in the state.
     * @param {XCodeState} state - The current state.
     * @param {PayloadAction<string>} action - The action containing the new code.
     */
    setCode: (state, action: PayloadAction<string>) => {
      state.code = action.payload;
    },
    /**
     * Set the programming language in the state.
     * @param {XCodeState} state - The current state.
     * @param {PayloadAction<string>} action - The action containing the new language.
     */
    setLanguage: (state, action: PayloadAction<string>) => {
      state.language = action.payload;
    },
    /**
     * Set the loading state.
     * @param {XCodeState} state - The current state.
     * @param {PayloadAction<boolean>} action - The action containing the loading state.
     */
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    /**
     * Set the result of the code execution.
     * @param {XCodeState} state - The current state.
     * @param {PayloadAction<Response>} action - The action containing the result.
     */
    setResult: (state, action: PayloadAction<Response>) => {
      state.result = action.payload;
    },
    /**
     * Set the list of files in the state.
     * @param {XCodeState} state - The current state.
     * @param {PayloadAction<File[]>} action - The action containing the new list of files.
     */
    setFiles: (state, action: PayloadAction<File[]>) => {
      state.files = action.payload;
    },
    /**
     * Set the current file type.
     * @param {XCodeState} state - The current state.
     * @param {PayloadAction<string>} action - The action containing the new file type.
     */
    setFile: (state, action: PayloadAction<string>) => {
      state.file = action.payload;
    },
    /**
     * Set the current file ID.
     * @param {XCodeState} state - The current state.
     * @param {PayloadAction<string | null>} action - The action containing the current file ID.
     */
    setCurrentFile: (state, action: PayloadAction<string | null>) => {
      state.currentFile = action.payload;
    },
    /**
     * Set the renaming state.
     * @param {XCodeState} state - The current state.
     * @param {PayloadAction<boolean>} action - The action containing the renaming state.
     */
    setRenaming: (state, action: PayloadAction<boolean>) => {
      state.isRenaming = action.payload;
    },
    /**
     * Set the new file name.
     * @param {XCodeState} state - The current state.
     * @param {PayloadAction<string>} action - The action containing the new file name.
     */
    setNewFileName: (state, action: PayloadAction<string>) => {
      state.newFileName = action.payload;
    },
    /**
     * Set the file ID to rename.
     * @param {XCodeState} state - The current state.
     * @param {PayloadAction<string | null>} action - The action containing the file ID to rename.
     */
    setFileToRename: (state, action: PayloadAction<string | null>) => {
      state.fileToRename = action.payload;
    },
    /**
     * Save the current file's content.
     * @param {XCodeState} state - The current state.
     * @param {PayloadAction<{ currentFile: string; code: string }>} action - The action containing the current file ID and code.
     */
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
} = xCodeCompilerSlice.actions;

export default xCodeCompilerSlice.reducer;