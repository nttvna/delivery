import { accountApi } from '@/api/account';
import { configureStore } from '@reduxjs/toolkit';
import systemReducer from './systemSlice';

export const store = configureStore({
  reducer: {
    System: systemReducer,
    [accountApi.reducerPath]: accountApi.reducer,
  },
  // Adding the middleware enables caching, invalidation, and other features
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(accountApi.middleware),
});