import { accountApi } from '@/api/account';
import { configureStore } from '@reduxjs/toolkit';

export const store = configureStore({
  reducer: {
    // Add the generated reducer as a specific top-level slice
    [accountApi.reducerPath]: accountApi.reducer,
  },
  // Adding the middleware enables caching, invalidation, and other features
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(accountApi.middleware),
});