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
    }),
});

export const {
    useGetInstructorCoursesQuery,
    useGetCourseByIdQuery,
    useUpdateCourseMutation,
    useCreateCourseMutation,
    useDeleteCourseMutation
} = courseApi;
