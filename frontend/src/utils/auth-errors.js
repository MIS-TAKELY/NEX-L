/**
 * Normalize better-auth / fetch errors for consistent UI handling.
 */
export function getAuthErrorMessage(error) {
  if (!error) return "Something went wrong";
  if (typeof error === "string") return error;
  return (
    error.message ||
    error.body?.message ||
    error.data?.message ||
    error.response?.data?.message ||
    "Something went wrong"
  );
}

export function isEmailNotVerifiedError(error) {
  const msg = getAuthErrorMessage(error).toLowerCase();
  const code = error?.code || error?.body?.code;
  if (code === "EMAIL_NOT_VERIFIED") return true;
  if (error?.status === 403 || error?.statusCode === 403) return true;
  return msg.includes("not verified") || msg.includes("verify your email");
}

export function isUserAlreadyExistsError(error) {
  const msg = getAuthErrorMessage(error).toLowerCase();
  return (
    msg.includes("already exists") ||
    msg.includes("use another email") ||
    error?.status === 422 ||
    error?.statusCode === 422
  );
}
