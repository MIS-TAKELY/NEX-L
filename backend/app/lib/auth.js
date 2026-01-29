import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "../config/dbConnect.js";

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL,
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
  advanced: {
    crossContext: true, // Allow requests without Origin header (e.g. Postman)
    trustedOrigins: [
      process.env.BETTER_AUTH_URL || "http://localhost:3000",
      "http://localhost:3001", // case-specific
      "http://localhost:5173"  // default vite port for frontend
    ],
  },
});



