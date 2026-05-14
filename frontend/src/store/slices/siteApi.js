import { apiSlice } from "./apiSlice";

const buildQueryString = (params = {}) => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.append(key, String(value));
    }
  });
  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

export const siteApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getPublicCourses: builder.query({
      query: () => "/courses",
      providesTags: [{ type: "Course", id: "PUBLIC_LIST" }],
    }),
    getAdminStats: builder.query({
      query: () => "/admin/stats",
      providesTags: ["User", "Course", "Enrollment"],
    }),
    getAdminUsers: builder.query({
      query: (params = {}) => `/admin/users${buildQueryString(params)}`,
      providesTags: ["User"],
    }),
    getAdminCourses: builder.query({
      query: (params = {}) => `/admin/courses${buildQueryString(params)}`,
      providesTags: ["Course"],
    }),
  }),
});

export const {
  useGetPublicCoursesQuery,
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useGetAdminCoursesQuery,
} = siteApi;

