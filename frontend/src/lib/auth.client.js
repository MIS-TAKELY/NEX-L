import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_BACKEND_URL + "/api/v1/auth",
  fetchOptions: {
    credentials: "include",
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
    console.log("Google login with role:", role);

    // Call backend to set a cookie on the backend domain
    await fetch(import.meta.env.VITE_BACKEND_URL + "/api/v1/auth/pre-social?role=" + role, {
      method: 'GET',
      credentials: 'include',
    });

    await authClient.signIn.social({
      provider: "google",
      callbackURL: `${import.meta.env.VITE_FRONTEND_URL}/${role}/dashboard`, // Dynamic redirect based on role
    });
  } catch (error) {
    console.error("Google login failed:", error);
    throw error;
  }
};

export const loginWithGithub = async (role = "student") => {
  try {
    console.log("Github login with role:", role);

    // Call backend to set a cookie on the backend domain
    await fetch(import.meta.env.VITE_BACKEND_URL + "/api/v1/auth/pre-social?role=" + role, {
      method: "GET",
      credentials: "include",
    });

    await authClient.signIn.social({
      provider: "github",
      callbackURL: `${import.meta.env.VITE_FRONTEND_URL}/${role}/dashboard`, // Dynamic redirect based on role
    });
  } catch (error) {
    console.error("Github login failed:", error);
    throw error;
  }
};