import { createAuthClient } from "better-auth/client";
const authClient = createAuthClient({ baseURL: "http://localhost:3000/api/v1/auth" });
console.log("forgetPassword:", authClient.forgetPassword);
console.log("requestPasswordReset:", authClient.requestPasswordReset);
