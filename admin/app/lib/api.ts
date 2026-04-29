const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api/v1";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  
  const defaultOptions: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    // Credentials 'include' is important for cookies (better-auth sessions)
    credentials: "include",
  };

  const response = await fetch(url, defaultOptions);
  
  if (response.status === 401) {
    // Handle unauthorized - maybe redirect to login?
    // window.location.href = "/login";
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "An error occurred" }));
    throw new Error(error.message || "Request failed");
  }

  return response.json();
}

export const adminApi = {
  getStats: () => fetchWithAuth("/admin/stats"),
  getUsers: (params: { page?: number; limit?: number; search?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/admin/users?${query}`);
  },
  updateUserRole: (userId: string, role: string) => 
    fetchWithAuth(`/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    }),
  getCourses: (params: { page?: number; limit?: number; status?: string; search?: string } = {}) => {
    const query = new URLSearchParams(params as any).toString();
    return fetchWithAuth(`/admin/courses?${query}`);
  },
  updateCourseStatus: (courseId: string, status: string) =>
    fetchWithAuth(`/admin/courses/${courseId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
  getSettings: () => fetchWithAuth("/admin/settings"),
  updateSetting: (key: string, value: any) =>
    fetchWithAuth("/admin/settings", {
      method: "PUT",
      body: JSON.stringify({ key, value }),
    }),
};
