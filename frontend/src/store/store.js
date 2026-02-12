import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import cartReducer from './slices/cartSlice';
import uiReducer from './slices/uiSlice';
import { apiSlice } from './slices/apiSlice';

export const store = configureStore({
    reducer: {
        auth: authReducer,
        cart: cartReducer,
        ui: uiReducer,
        [apiSlice.reducerPath]: apiSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(apiSlice.middleware),
});
