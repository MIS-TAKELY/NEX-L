import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: import.meta.env.VITE_BACKEND_URL + '/api/v1',
        prepareHeaders: (headers, { getState }) => {
            // Include credentials for sessions if needed
            return headers;
        },
        credentials: 'include',
    }),
    tagTypes: ['Course', 'User', 'Cart', 'Enrollment'],
    endpoints: (builder) => ({
        // Endpoints will be injected from other files or defined here
    }),
});
