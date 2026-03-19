import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "../config/dbConnect.js";

const rawBaseURL = (process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/+$/, "");
const baseURL = rawBaseURL.endsWith("/api/v1/auth") ? rawBaseURL : `${rawBaseURL}/api/v1/auth`;

console.log("Better Auth initializing with baseURL:", baseURL);
console.log("Environment FRONTEND_URL:", process.env.FRONTEND_URL);

if (process.env.NODE_ENV !== "production") {
  console.warn("[WARNING] NODE_ENV is not set to 'production'. Cross-site cookies may be blocked by browsers like Chrome/Brave.");
}

export const auth = betterAuth({
  baseURL,
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
    "https://nex-l.vercel.app", // Fallback for safety
    "https://nex-l.onrender.com",
    "http://localhost:5173",
    "http://127.0.0.1:5173",
  ].filter(Boolean),

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
    defaultCookieAttributes: {
      sameSite: "none",
      secure: true, 
      path: "/", // Ensure cookies are available globally on the domain
    },
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

          // Priority: 1) pending_role cookie (social login), 2) role from signup form, 3) default "student"
          if (pendingRole && (pendingRole === "student" || pendingRole === "instructor")) {
            console.log(`Setting user role to ${pendingRole} from pending_role cookie (social login)`);
            user.role = pendingRole;
          } else if (user.role && (user.role === "student" || user.role === "instructor")) {
            console.log(`Keeping user role as ${user.role} from signup form`);
            // user.role is already set correctly — no override needed
          } else {
            console.log("No valid role found from cookie or form, defaulting to student");
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
  onResponse: async (response, context) => {
    // Log cookie setting for debugging
    const setCookie = response.headers.get("set-cookie");
    if (setCookie) {
      console.log(`[Better-Auth DEBUG] Set-Cookie: ${setCookie}`);
    }
    return { response };
  },
});



console.log("Better Auth Setup Complete. baseURL:", baseURL);
