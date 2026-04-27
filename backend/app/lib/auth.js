import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { client } from "../config/dbConnect.js";
import { sendEmail } from "../config/mail.js";
import { isAppRole, mergeRolesJson, normalizeRole, parseRolesFromUser } from "./roles.js";

const rawBaseURL = (process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/+$/, "");
const baseURL = rawBaseURL.endsWith("/api/v1/auth") ? rawBaseURL : `${rawBaseURL}/api/v1/auth`;
const frontendURL = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/+$/, "");

function resolveFrontendOrigin(request) {
  try {
    if (request) {
      const origin = request.headers.get("origin");
      if (origin) {
        return origin.replace(/\/+$/, "");
      }
      
      const referer = request.headers.get("referer");
      if (referer) {
        const url = new URL(referer);
        return url.origin;
      }
    }
  } catch (err) {
    console.error("Failed to resolve frontend origin:", err);
  }

  if (frontendURL) return frontendURL;
  return "http://localhost:5173";
}

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
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    sendResetPassword: async ({ user, token }, request) => {
      const origin = resolveFrontendOrigin(request);
      const finalUrl = `${origin}/reset-password?token=${encodeURIComponent(token)}`;

      // Non-blocking: send the email in the background so the user doesn't wait for SMTP transmission
      sendEmail({
        to: user.email,
        subject: "Reset your password - NEX-L",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaec; border-radius: 8px; padding: 20px;">
            <h2 style="color: #333;">Password Reset Request</h2>
            <p style="color: #555; line-height: 1.5;">Hi ${user.name || "there"},</p>
            <p style="color: #555; line-height: 1.5;">We received a request to reset your password for your NEX-L account. Click the button below to reset it.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${finalUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Reset Password</a>
            </div>
            <p style="color: #555; line-height: 1.5;">If you didn't request a password reset, you can safely ignore this email. Your password will not be changed.</p>
          </div>
        `,
      }).catch(err => {
        console.error(`[Reset Password Email Error] Failed to send to ${user.email}:`, err);
      });
    },
  },
  emailVerification: {
    sendVerificationEmail: async ({ user, url, token }, request) => {
      let finalUrl = url;
      try {
        if (request) {
          const reqHost = request.headers.get("x-forwarded-host") || request.headers.get("host");
          const reqProto = request.headers.get("x-forwarded-proto") || (reqHost?.includes("localhost") || reqHost?.includes("127.0.0.1") ? "http" : "https");
          if (reqHost) {
            const parsed = new URL(url);
            // Replace the hardcoded baseURL host with the actual request host
            parsed.host = reqHost;
            parsed.protocol = reqProto + ":";
            finalUrl = parsed.toString();
          }
        }
      } catch (err) {
        console.error("Failed to parse verification url", err);
      }

      // Non-blocking: send the email in the background so the user doesn't wait for SMTP transmission
      sendEmail({
        to: user.email,
        subject: "Verify your email address - NEX-L",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eaeaec; border-radius: 8px; padding: 20px;">
            <h2 style="color: #333;">Welcome to NEX-L!</h2>
            <p style="color: #555; line-height: 1.5;">Hi ${user.name || "there"},</p>
            <p style="color: #555; line-height: 1.5;">Please verify your email address to complete your registration and log in.</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${finalUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 6px; font-weight: bold;">Verify Email</a>
            </div>
            <p style="color: #888; font-size: 0.9em;">If you didn't request this, you can safely ignore this email.</p>
          </div>
        `,
      }).catch(err => {
        console.error(`[Verification Email Error] Failed to send to ${user.email}:`, err);
      });
    },
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

  // Add custom user fields for role management (roles = JSON array string for dual-role users)
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "student",
        input: true,
      },
      roles: {
        type: "string",
        required: false,
        defaultValue: '["student"]',
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
          const cookieHeader = context?.request?.headers?.get?.("cookie");
          const cookies = cookieHeader ? cookieHeader.split(";").reduce((acc, cookie) => {
            const [name, ...rest] = cookie.trim().split("=");
            acc[name] = rest.join("=");
            return acc;
          }, {}) : {};

          const pendingRole = cookies["pending_role"];
          let resolved = "student";
          if (pendingRole && isAppRole(pendingRole)) {
            resolved = normalizeRole(pendingRole);
          } else if (user.role && isAppRole(user.role)) {
            resolved = normalizeRole(user.role);
          }

          const rolesJson = JSON.stringify([resolved]);
          return {
            data: {
              ...user,
              role: resolved,
              roles: rolesJson,
            },
          };
        },
      },
    },
    session: {
      create: {
        after: async (session, ctx) => {
          try {
            const reqUrl = ctx?.request?.url || "";
            if (!reqUrl.includes("/callback/")) return;

            const cookieHeader = ctx?.request?.headers?.get?.("cookie");
            const cookies = cookieHeader ? cookieHeader.split(";").reduce((acc, cookie) => {
              const [name, ...rest] = cookie.trim().split("=");
              acc[name] = rest.join("=");
              return acc;
            }, {}) : {};

            const pendingRole = cookies["pending_role"];
            if (!pendingRole || !isAppRole(pendingRole) || !session?.userId) return;

            const normalized = normalizeRole(pendingRole);
            const internal = ctx?.context?.internalAdapter;
            if (!internal) return;

            const user = await internal.findUserById(session.userId);
            if (!user) return;

            const merged = mergeRolesJson(user.roles ?? null, normalized);
            const list = parseRolesFromUser({ roles: merged, role: user.role });
            if (list.length === 0) return;

            await internal.updateUser(session.userId, {
              roles: merged,
              role: normalized,
            });
          } catch (e) {
            console.error("[session.create.after] role merge failed:", e);
          }
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
