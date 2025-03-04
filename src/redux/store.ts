import { configureStore } from '@reduxjs/toolkit';
import xCodeCompilerSlice from './xCodeCompiler';
import xCodeAuthSlice from './xCodeAuth';

export const store = configureStore({
  reducer: {
    xCodeCompiler: xCodeCompilerSlice,
    xCodeAuth: xCodeAuthSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;