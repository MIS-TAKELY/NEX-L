import { createAuthClient } from "better-auth/react";

// NEXT_PUBLIC_API_URL is the canonical API base, e.g. https://nex-l.onrender.com/api/v1.
// Auth and admin data requests must hit the same backend origin so cookies line up.
const backendOrigin =
  // Prefer the API URL and strip the `/api/v1` suffix to get the shared origin.
  (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/api\/v1\/?$/, "") ||
  // Fallback to an explicit backend origin if the API URL is not set.
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  "http://localhost:3000";

export const authClient = createAuthClient({
  baseURL: `${backendOrigin}/api/v1/auth`,
  fetchOptions: {
    credentials: "include",
  },
});
