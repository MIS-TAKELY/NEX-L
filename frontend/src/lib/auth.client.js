import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api/v1/auth",
  fetchOptions: {
    credentials: "include",
    onRequest(context) {
      // Attach Bearer token if we have one saved from OAuth redirect
      const token = localStorage.getItem("session_token");
      if (token) {
        if (context.request) {
          context.request.headers.set("Authorization", `Bearer ${token}`);
        } else {
          context.options = context.options || {};
          context.options.headers = context.options.headers || {};
          if (typeof context.options.headers.set === 'function') {
            context.options.headers.set("Authorization", `Bearer ${token}`);
          } else {
            context.options.headers = {
              ...context.options.headers,
              Authorization: `Bearer ${token}`,
            };
          }
        }
      }
    },
  },
});

// Utility function to get current session
export const getSession = async () => {
  try {
    const session = await authClient.getSession();
    return session.data;
  } catch (error) {
    console.error("Failed to get session:", error);
    return null;
  }
};

// Utility function to sign up
export const signUp = async (email, password, name = "", role = "student") => {
  try {
    const result = await authClient.signUp.email({
      email,
      password,
      name,
      role, // Include role in signup
    });
    return result;
  } catch (error) {
    console.error("Sign up failed:", error);
    throw error;
  }
};

// Utility function to sign in
export const signIn = async (email, password) => {
  try {
    const result = await authClient.signIn.email({
      email,
      password,
    });
    return result;
  } catch (error) {
    console.error("Sign in failed:", error);
    throw error;
  }
};

// Utility function to sign out
export const signOut = async () => {
  try {
    const { error } = await authClient.signOut();
    localStorage.removeItem("session_token");
    if (error) {
      throw error;
    }
  } catch (error) {
    console.warn("Client signOut failed, attempting manual fetch", error);
    // Fallback manual fetch to ensure cookie clearance
    try {
      await fetch(import.meta.env.VITE_BACKEND_URL + "/api/v1/auth/sign-out", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
      });
    } catch (manualError) {
      console.error("Manual sign out failed:", manualError);
      throw manualError;
    }
  }
};




export const loginWithGoogle = async (role = "student") => {
  try {
    console.log("Starting Google login for role:", role);
    const callbackURL = `${import.meta.env.VITE_FRONTEND_URL}/${role}/dashboard`;
    
    // Direct redirect to the backend to start the OAuth flow as a 1st party navigation
    // This bypasses third-party cookie blocking in browsers like Chrome/Safari
    const redirectUrl = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/social-redirect`);
    redirectUrl.searchParams.append("provider", "google");
    redirectUrl.searchParams.append("role", role);
    redirectUrl.searchParams.append("callbackURL", callbackURL);
    
    window.location.href = redirectUrl.toString();
  } catch (error) {
    console.error("Google login failed:", error);
    throw error;
  }
};

export const loginWithGithub = async (role = "student") => {
  try {
    console.log("Starting Github login for role:", role);
    const callbackURL = `${import.meta.env.VITE_FRONTEND_URL}/${role}/dashboard`;

    // Direct redirect to the backend to start the OAuth flow as a 1st party navigation
    const redirectUrl = new URL(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/social-redirect`);
    redirectUrl.searchParams.append("provider", "github");
    redirectUrl.searchParams.append("role", role);
    redirectUrl.searchParams.append("callbackURL", callbackURL);
    
    window.location.href = redirectUrl.toString();
  } catch (error) {
    console.error("Github login failed:", error);
    throw error;
  }
};