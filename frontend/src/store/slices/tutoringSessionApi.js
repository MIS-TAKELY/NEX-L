import { apiSlice } from "./apiSlice";

export const tutoringSessionApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    createTutoringSession: builder.mutation({
      query: (sessionData) => ({
        url: "/tutoring-sessions",
        method: "POST",
        body: sessionData,
      }),
      invalidatesTags: ["TutoringSession"],
    }),
    getTeacherSessions: builder.query({
      query: () => "/tutoring-sessions/teacher",
      providesTags: ["TutoringSession"],
    }),
    getStudentSessions: builder.query({
      query: () => "/tutoring-sessions/student",
      providesTags: ["TutoringSession"],
    }),
    updateTutoringSessionStatus: builder.mutation({
      query: ({ id, status }) => ({
        url: `/tutoring-sessions/${id}/status`,
        method: "PATCH",
        body: { status },
      }),
      invalidatesTags: ["TutoringSession"],
    }),
  }),
});

export const {
  useCreateTutoringSessionMutation,
  useGetTeacherSessionsQuery,
  useGetStudentSessionsQuery,
  useUpdateTutoringSessionStatusMutation,
} = tutoringSessionApi;
