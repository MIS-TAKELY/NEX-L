import { apiSlice } from "./apiSlice";

export const courseApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getInstructorCourses: builder.query({
            query: (instructorId) => `/courses/instructor/${instructorId}`,
            providesTags: (result) =>
                result
                    ? [
                        ...result.map(({ _id }) => ({ type: 'Course', id: _id })),
                        { type: 'Course', id: 'LIST' },
                    ]
                    : [{ type: 'Course', id: 'LIST' }],
        }),
        getInstructorAnalytics: builder.query({
            query: (instructorId) => `/courses/instructor/${instructorId}/analytics`,
            providesTags: ['Course'],
        }),
        getCourseById: builder.query({
            query: (id) => `/courses/${id}`,
            providesTags: (result, error, id) => [{ type: 'Course', id }],
        }),
        updateCourse: builder.mutation({
            query: ({ id, payload }) => ({
                url: `/courses/${id}`,
                method: 'PUT',
                body: payload,
            }),
            invalidatesTags: (result, error, { id }) => [
                { type: 'Course', id },
                { type: 'Course', id: 'LIST' },
            ],
        }),
        createCourse: builder.mutation({
            query: (payload) => ({
                url: '/courses',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: [{ type: 'Course', id: 'LIST' }],
        }),
        deleteCourse: builder.mutation({
            query: (id) => ({
                url: `/courses/${id}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, id) => [
                { type: 'Course', id },
                { type: 'Course', id: 'LIST' },
            ],
        }),
        getCourseSections: builder.query({
            query: (userId) => `/courses/sections${userId ? `?userId=${userId}` : ''}`,
            providesTags: [{ type: 'Course', id: 'LIST' }],
        }),
        recordCourseView: builder.mutation({
            query: (payload) => ({
                url: '/courses/record-view',
                method: 'POST',
                body: payload,
            }),
        }),
        searchCoursesVector: builder.query({
            query: (params) => {
                const searchParams = new URLSearchParams();
                if (params.q) searchParams.append('q', params.q);
                if (params.category) searchParams.append('category', params.category);
                if (params.level) searchParams.append('level', params.level);
                if (params.minPrice) searchParams.append('minPrice', params.minPrice);
                if (params.maxPrice) searchParams.append('maxPrice', params.maxPrice);
                return `/courses/search?${searchParams.toString()}`;
            },
            providesTags: [{ type: 'Course', id: 'LIST' }],
        }),
        generateContent: builder.mutation({
            query: (payload) => ({
                url: '/courses/generate-content',
                method: 'POST',
                body: payload,
            }),
        }),
        getEnrollmentByCourse: builder.query({
            query: ({ studentId, courseId }) => `/enrollments/get-by-course/${studentId}/${courseId}`,
            providesTags: ['Course'],
        }),
        markContentCompleted: builder.mutation({
            query: (payload) => ({
                url: '/enrollments/mark-completed',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: ['Course'],
        }),
        summarizeContent: builder.mutation({
            query: (payload) => ({
                url: '/courses/summarize-content',
                method: 'POST',
                body: payload,
            }),
        }),
        askAI: builder.mutation({
            query: (payload) => ({
                url: '/courses/ask-ai',
                method: 'POST',
                body: payload,
            }),
        }),
    }),
});

export const {
    useGetInstructorCoursesQuery,
    useGetInstructorAnalyticsQuery,
    useGetCourseByIdQuery,
    useUpdateCourseMutation,
    useCreateCourseMutation,
    useDeleteCourseMutation,
    useGetCourseSectionsQuery,
    useRecordCourseViewMutation,
    useSearchCoursesVectorQuery,
    useGenerateContentMutation,
    useGetEnrollmentByCourseQuery,
    useMarkContentCompletedMutation,
    useSummarizeContentMutation,
    useAskAIMutation,
} = courseApi;
