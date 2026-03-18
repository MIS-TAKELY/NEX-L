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
    console.log("Starting Google login for role:", role);

    // 1. First, call pre-social to set the pending_role cookie on the backend domain.
    // We use a direct window.location if we were doing a full redirect, but 
    // fetch with credentials: 'include' should work if CORS is correct.
    const preSocialUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/pre-social?role=${role}`;
    
    await fetch(preSocialUrl, {
      method: 'GET',
      credentials: 'include',
    });

    console.log("Pre-social cookie call finished, initiating social sign-in...");

    // 2. Initiate social sign-in. 
    // The callbackURL MUST be a full URL pointing back to your frontend.
    const callbackURL = `${import.meta.env.VITE_FRONTEND_URL}/${role}/dashboard`;
    
    await authClient.signIn.social({
      provider: "google",
      callbackURL: callbackURL,
    });
  } catch (error) {
    console.error("Google login failed:", error);
    throw error;
  }
};

export const loginWithGithub = async (role = "student") => {
  try {
    console.log("Starting Github login for role:", role);

    const preSocialUrl = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth/pre-social?role=${role}`;

    await fetch(preSocialUrl, {
      method: "GET",
      credentials: "include",
    });

    console.log("Pre-social cookie call finished, initiating social sign-in...");

    const callbackURL = `${import.meta.env.VITE_FRONTEND_URL}/${role}/dashboard`;

    await authClient.signIn.social({
      provider: "github",
      callbackURL: callbackURL,
    });
  } catch (error) {
    console.error("Github login failed:", error);
    throw error;
  }
};