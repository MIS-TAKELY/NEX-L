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
    github: {
      clientId: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
    },



  },
  trustedOrigins: [
    process.env.BETTER_AUTH_URL,
    process.env.FRONTEND_URL,
  ],

  // Add custom user fields for role management
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: true,
      },
    },
  },

  advanced: {
    crossSite: true,
    trustProxy: true,
  },

  cookieOptions: {
    sameSite: "none",
    secure: process.env.NODE_ENV === "production",
  },

  // Include role in session
  session: {
    modelName: "session",
  },

  databaseHooks: {
    user: {
      create: {
        before: async (user, context) => {
          console.log("--- databaseHooks: user.create.before ---");

          // Read the pending_role cookie
          const cookieHeader = context.request.headers.get("cookie");
          const cookies = cookieHeader ? cookieHeader.split(";").reduce((acc, cookie) => {
            const [name, value] = cookie.trim().split("=");
            acc[name] = value;
            return acc;
          }, {}) : {};

          const pendingRole = cookies["pending_role"];
          console.log("Cookie pending_role found:", pendingRole);

          if (pendingRole && (pendingRole === "student" || pendingRole === "instructor")) {
            console.log(`Setting user role to ${pendingRole} from database hook`);
            user.role = pendingRole;
          } else {
            console.log("No valid pending_role cookie, defaulting to student");
            user.role = "student";
          }

          return {
            data: user,
          };
        },
      },
      update: {
        before: async (data, context) => {
          console.log("--- databaseHooks: user.update.before ---");

          const cookieHeader = context.request.headers.get("cookie");
          const cookies = cookieHeader ? cookieHeader.split(";").reduce((acc, cookie) => {
            const [name, value] = cookie.trim().split("=");
            acc[name] = value;
            return acc;
          }, {}) : {};

          const pendingRole = cookies["pending_role"];
          if (pendingRole && (pendingRole === "student" || pendingRole === "instructor")) {
            console.log(`Updating existing user role to ${pendingRole} from database hook`);
            data.role = pendingRole;
          }

          return {
            data: data,
          };
        },
      },
    },
  },
});



console.log(
  "Auth initialized with baseURL:",
  process.env.BETTER_AUTH_URL + "/api/v1/auth",
);
console.log("Trusted Origins:", [
  process.env.BETTER_AUTH_URL,
  process.env.FRONTEND_URL,
]);
