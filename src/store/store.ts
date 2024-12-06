import { configureStore } from '@reduxjs/toolkit';
import predictorReducer from './predictorSlice';

export const store = configureStore({
  reducer: {
    predictor: predictorReducer
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;