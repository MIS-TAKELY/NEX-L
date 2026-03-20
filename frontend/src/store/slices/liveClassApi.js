import { apiSlice } from "./apiSlice";

export const liveClassApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getCourseLiveClasses: builder.query({
            query: (courseId) => `/live-classes/course/${courseId}`,
            providesTags: (result, error, courseId) => [
                { type: 'LiveClass', id: `COURSE_${courseId}` },
                ...(result ? result.map(({ _id }) => ({ type: 'LiveClass', id: _id })) : []),
            ],
        }),
        getUpcomingLiveClasses: builder.query({
            query: () => '/live-classes/upcoming',
            providesTags: [{ type: 'LiveClass', id: 'UPCOMING' }],
        }),
        getInstructorActiveClasses: builder.query({
            query: () => '/live-classes/active',
            providesTags: (result) => [
                { type: 'LiveClass', id: 'ACTIVE_INSTRUCTOR' },
                ...(result ? result.map(({ _id }) => ({ type: 'LiveClass', id: _id })) : []),
            ],
        }),
        scheduleLiveClass: builder.mutation({
            query: (payload) => ({
                url: '/live-classes/schedule',
                method: 'POST',
                body: payload,
            }),
            invalidatesTags: (result, error, { courseId }) => [
                { type: 'LiveClass', id: `COURSE_${courseId}` },
                { type: 'LiveClass', id: 'UPCOMING' },
            ],
        }),
        updateLiveClass: builder.mutation({
            query: ({ classId, payload }) => ({
                url: `/live-classes/${classId}`,
                method: 'PATCH',
                body: payload,
            }),
            invalidatesTags: (result, error, { classId, courseId }) => [
                { type: 'LiveClass', id: classId },
                { type: 'LiveClass', id: `COURSE_${courseId}` },
                { type: 'LiveClass', id: 'UPCOMING' },
            ],
        }),
        deleteLiveClass: builder.mutation({
            query: ({ classId, courseId }) => ({
                url: `/live-classes/${classId}`,
                method: 'DELETE',
            }),
            invalidatesTags: (result, error, { courseId }) => [
                { type: 'LiveClass', id: `COURSE_${courseId}` },
                { type: 'LiveClass', id: 'UPCOMING' },
            ],
        }),
        endAllCourseLiveClasses: builder.mutation({
            query: (courseId) => ({
                url: `/live-classes/course/${courseId}/end-all-live`,
                method: 'PATCH',
            }),
            invalidatesTags: (result, error, courseId) => [
                { type: 'LiveClass', id: `COURSE_${courseId}` },
                { type: 'LiveClass', id: 'UPCOMING' },
            ],
        }),
    }),
});

export const {
    useGetCourseLiveClassesQuery,
    useGetUpcomingLiveClassesQuery,
    useScheduleLiveClassMutation,
    useUpdateLiveClassMutation,
    useDeleteLiveClassMutation,
    useEndAllCourseLiveClassesMutation,
    useGetInstructorActiveClassesQuery,
} = liveClassApi;
