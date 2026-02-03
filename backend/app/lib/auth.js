import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "../config/dbConnect.js";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL + "/api/v1/auth",
  secret: process.env.BETTER_AUTH_SECRET,

  database: mongodbAdapter(client.db()),
  emailAndPassword: {
    enabled: true, // Enable email/password auth
  },
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL || "http://localhost:3000",
    "http://localhost:5173",
  ],

  // Add custom user fields for role management
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: true, // Allow role to be set during signup
      },
    },
  },

  // Include role in session
  session: {
    modelName: "session",
  },
});

console.log(
  "Auth initialized with baseURL:",
  process.env.BETTER_AUTH_URL + "/api/v1/auth",
);
console.log("Trusted Origins:", [
  process.env.BETTER_AUTH_URL || "http://localhost:3000",
  "http://localhost:5173",
]);
