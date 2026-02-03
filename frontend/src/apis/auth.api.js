const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export const base_url = `${BACKEND_URL}/api/v1`;

export const authApis = {
  SIGNIN_URL: `${base_url}/auth/sign-in/email`,
  SIGNUP_URL: `${base_url}/auth/sign-up/email`,
};
