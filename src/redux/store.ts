
// src/store.ts
import { configureStore } from '@reduxjs/toolkit';
import xCodeSlice from './slice'; 

export const store = configureStore({
  reducer: {
    xCode: xCodeSlice,
  },
});

// TypeScript types for hooks
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;