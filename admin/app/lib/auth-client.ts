import { createAuthClient } from "better-auth/react";

// NEXT_PUBLIC_BACKEND_URL = base origin only, e.g. https://nex-l.onrender.com
// NEXT_PUBLIC_API_URL     = full API base,    e.g. https://nex-l.onrender.com/api/v1
// auth-client needs the origin-only URL so it can append /api/v1/auth itself.
const backendOrigin =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  // Fallback: strip a trailing /api/v1 from NEXT_PUBLIC_API_URL if present
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000").replace(/\/api\/v1\/?$/, "");

export const authClient = createAuthClient({
  baseURL: `${backendOrigin}/api/v1/auth`,
  fetchOptions: {
    credentials: "include",
  },
});
