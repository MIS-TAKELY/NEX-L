import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const apiSlice = createApi({
    reducerPath: 'api',
    baseQuery: fetchBaseQuery({
        baseUrl: `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'}/api/v1`,
        prepareHeaders: (headers) => {
            // Include credentials for sessions if needed
            return headers;
        },
        credentials: 'include',
    }),
    tagTypes: ['Course', 'User', 'Cart', 'Enrollment', 'TutoringSession'],
    endpoints: (_builder) => ({
        // Endpoints will be injected from other files or defined here
    }),
});
