
// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import xCodeCompilerSlice from './xCodeCompiler';

export const store = configureStore({
  reducer: {
    xCodeCompiler: xCodeCompilerSlice,
  },
});

// TypeScript types for hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;