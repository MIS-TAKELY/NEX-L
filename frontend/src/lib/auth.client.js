import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
    baseURL: import.meta.env.VITE_BACKEND_URL + "/api/v1/auth",
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
        await authClient.signOut();
    } catch (error) {
        console.error("Sign out failed:", error);
        throw error;
    }
};
