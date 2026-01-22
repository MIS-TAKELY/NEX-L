import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import mongoose from "mongoose";

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,

  database: mongodbAdapter({
    client: mongoose.connection.getClient(),
    dbName: mongoose.connection.name,
  }),

  emailAndPassword: {
    enabled: true,
  },

  session: {
    cookie: {
      secure: false,
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    },
  },
});
