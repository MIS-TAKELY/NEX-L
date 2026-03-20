import { apiSlice } from "./apiSlice";

export const enrollmentApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getInstructorStats: builder.query({
            query: (instructorId) => `/enrollments/instructor/${instructorId}/stats`,
            providesTags: ['Enrollment'],
        }),
        getInstructorStudents: builder.query({
            query: (instructorId) => `/enrollments/instructor/${instructorId}/students`,
            providesTags: ['Enrollment'],
        }),
    }),
});

export const {
    useGetInstructorStatsQuery,
    useGetInstructorStudentsQuery,
} = enrollmentApi;
