import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";

import assignmentRouter from "../app/routes/assignment.routes.js";
import authRouter from "../app/routes/auth.routes.js";
import courseRouter from "../app/routes/course.routes.js";
import lessonRouter from "../app/routes/lesson.routes.js";
import testMail from "../app/routes/test-mail.routes.js";
import userRouter from "../app/routes/user.routes.js";
import uploadRouter from "../app/routes/upload.routes.js";
import paymentRouter from "../app/routes/payment.routes.js";
import cartRouter from "../app/routes/cart.routes.js";
import enrollmentRouter from "../app/routes/enrollment.routes.js";
import contactRouter from "../app/routes/contact.routes.js";
import couponRouter from "../app/routes/coupon.routes.js";
import quizRouter from "../app/routes/quiz.routes.js";
import streamRouter from "../app/routes/stream.routes.js";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./lib/auth.js";

const app = express();
app.set("trust proxy", true); // Required for Render load balancer to handle secure cookies

app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL, 
      "https://nex-l.vercel.app",
      "https://nex-l.onrender.com",
      "http://localhost:5173", 
      "http://127.0.0.1:5173",
      // "http://localhost:5174",
      // "http://127.0.0.1:5174"
    ].filter(Boolean),
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());


app.get("/favicon.ico", (req, res) => res.status(204).end());

app.get("/", (req, res) => {
  const { error } = req.query;
  const frontendURL = process.env.FRONTEND_URL || "https://nex-l.vercel.app";
  
  if (error) {
    return res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>NEXL - Auth Error</title>
          <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #0c0c0e; color: #fff; text-align: center; }
              .card { background: rgba(255, 255, 255, 0.05); padding: 40px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); max-width: 400px; }
              h1 { color: #ff4d4d; margin-top: 0; }
              p { font-size: 1.1rem; color: #a0a0a0; margin-bottom: 25px; }
              .btn { display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; transition: all 0.2s; }
              .btn:hover { background: #2563eb; transform: translateY(-2px); }
          </style>
      </head>
      <body>
          <div class="card">
              <h1>Authentication Error</h1>
              <p>We encountered a problem: <strong>${error}</strong>. This often happens if the login session expires or cookies are blocked.</p>
              <a href="${frontendURL}" class="btn">Try Again</a>
          </div>
      </body>
      </html>
    `);
  }

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="refresh" content="3;url=${frontendURL}">
        <title>NEXL Backend</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #0c0c0e; color: #fff; text-align: center; }
            .loader { border: 3px solid rgba(255, 255, 255, 0.1); border-top: 3px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            h2 { margin-top: 0; }
            p { color: #a0a0a0; }
        </style>
    </head>
    <body>
        <div>
            <div class="loader"></div>
            <h2>NEXL Backend is live!</h2>
            <p>Redirecting you to the frontend... <br> <small>Click <a href="${frontendURL}" style="color: #3b82f6;">here</a> if not redirected automatically.</small></p>
        </div>
    </body>
    </html>
  `);
});

// Custom endpoint to bypass third-party cookie blocking during social login
app.get("/api/v1/auth/social-redirect", (req, res) => {
  const { provider, role, callbackURL } = req.query;
  
  if (!provider) {
    return res.status(400).send("Provider is required");
  }

  // Set the role cookie (1st party context now, so it won't be blocked)
  if (role) {
    res.cookie("pending_role", role, {
      httpOnly: false,
      secure: true,
      sameSite: "none",
      path: "/",
      maxAge: 3600000,
    });
  }

  // Serve a simple page that requires a button click. 
  // Strict browsers (Safari ITP / Chrome) often BLOCK cookies set during pure 
  // automated redirect chains across domains without actual user interaction.
  // The button click provides the "user gesture" needed for the browser to SAVE the state cookie.
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sign in with ${providerName}</title>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; background-color: #0c0c0e; color: #fff; margin: 0; }
          .container { background: rgba(255, 255, 255, 0.05); padding: 40px; border-radius: 20px; border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px); max-width: 400px; text-align: center; }
          .btn { display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 600; cursor: pointer; border: none; font-size: 1rem; transition: all 0.2s; margin-top: 20px; }
          .btn:hover { background: #2563eb; transform: translateY(-2px); }
          .btn:disabled { opacity: 0.7; cursor: not-allowed; transform: none; }
          h2 { margin-top: 0; }
          p { color: #a0a0a0; }
        </style>
    </head>
    <body>
        <div class="container">
            <h2>Secure Sign In</h2>
            <p>You are being securely connected to ${providerName}. Please click below to continue.</p>
            <button id="auth-btn" class="btn">Continue with ${providerName}</button>
            <p id="error-text" style="color: #ff4d4d; display: none; margin-top: 15px; font-size: 0.9rem;"></p>
        </div>
        <script>
          document.getElementById('auth-btn').addEventListener('click', function() {
            this.disabled = true;
            this.innerText = 'Connecting...';
            const errorText = document.getElementById('error-text');
            errorText.style.display = 'none';

            fetch('/api/v1/auth/sign-in/social', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              credentials: 'include',
              body: JSON.stringify({ 
                provider: '${provider}', 
                callbackURL: '${callbackURL || (process.env.FRONTEND_URL || "https://nex-l.vercel.app")}' 
              })
            })
            .then(res => res.json())
            .then(data => {
              if (data.url) {
                window.location.href = data.url;
              } else if (data.redirect) {
                window.location.href = data.redirect;
              } else {
                this.disabled = false;
                this.innerText = 'Continue with ${providerName}';
                errorText.innerText = "Error: " + JSON.stringify(data);
                errorText.style.display = 'block';
              }
            })
            .catch(err => {
              this.disabled = false;
              this.innerText = 'Continue with ${providerName}';
              errorText.innerText = "Error connecting to server. Please try again.";
              errorText.style.display = 'block';
              console.error(err);
            });
          });
        </script>
    </body>
    </html>
  `);
});

// other APIs
app.use("/api/v1/auth/pre-social", authRouter); // Only handle /pre-social here

// Better Auth Handler - With social callback interceptor
// We intercept the final redirect after OAuth to append the session token to the URL.
// This is necessary because browsers block third-party cookies between
// nex-l.onrender.com (backend) and nex-l.vercel.app (frontend).
app.use("/api/v1/auth", (req, res, next) => {
  const isOAuthCallback =
    req.path === "/callback/google" || req.path === "/callback/github";

  if (isOAuthCallback) {
    // Wrap res.redirect to intercept better-auth's final redirect
    const originalRedirect = res.redirect.bind(res);
    const originalSetHeader = res.setHeader.bind(res);

    // Intercept setHeader calls for 'Location'
    res.setHeader = function (name, value) {
      if (name.toLowerCase() === "location" && typeof value === "string") {
        // Look for the session cookie in res.getHeaders()
        const cookies = res.getHeader("set-cookie");
        let sessionToken = null;
        if (cookies) {
          const cookieList = Array.isArray(cookies) ? cookies : [cookies];
          for (const cookie of cookieList) {
            const match = cookie.match(/better-auth\.session_token=([^;]+)/);
            if (match) {
              sessionToken = match[1];
              break;
            }
          }
        }
        if (sessionToken) {
          try {
            const redirectURL = new URL(value);
            redirectURL.searchParams.set("session_token", sessionToken);
            value = redirectURL.toString();
            console.log("[OAuth Interceptor] Appended session_token to redirect:", value);
          } catch (e) {
            console.error("[OAuth Interceptor] Failed to parse redirect URL:", e);
          }
        }
      }
      return originalSetHeader(name, value);
    };

    // Also intercept res.redirect in case better-auth calls it directly
    res.redirect = function (urlOrStatus, url) {
      let status = 302;
      let location;
      if (typeof urlOrStatus === "number") {
        status = urlOrStatus;
        location = url;
      } else {
        location = urlOrStatus;
      }

      // Look for session token in set-cookie headers
      const cookies = res.getHeader("set-cookie");
      let sessionToken = null;
      if (cookies) {
        const cookieList = Array.isArray(cookies) ? cookies : [cookies];
        for (const cookie of cookieList) {
          const match = cookie.match(/better-auth\.session_token=([^;]+)/);
          if (match) {
            sessionToken = match[1];
            break;
          }
        }
      }
      if (sessionToken && location) {
        try {
          const redirectURL = new URL(location);
          redirectURL.searchParams.set("session_token", sessionToken);
          location = redirectURL.toString();
          console.log("[OAuth Interceptor] Appended session_token via redirect():", location);
        } catch (e) {
          console.error("[OAuth Interceptor] Failed to parse redirect URL:", e);
        }
      }
      return originalRedirect(status, location);
    };
  }

  toNodeHandler(auth)(req, res);
});


app.use("/api/v1/users", userRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/lessons", lessonRouter);
app.use("/api/v1/assignments", assignmentRouter);
app.use("/api/v1/test-mail", testMail);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/enrollments", enrollmentRouter);
app.use("/api/v1/contact", contactRouter);
app.use("/api/v1/coupons", couponRouter);
app.use("/api/v1/quizzes", quizRouter);
app.use("/api/v1/stream", streamRouter);

// Error logger - MUST BE LAST
app.use((err, req, res, next) => {
  console.error("ERROR:", err);
  res.status(err.status || 500).json({
    message: err.message || "Internal Server Error",
    error: {
      message: err.message,
      stack: err.stack,
      ...(typeof err === 'object' ? err : {})
    }
  });
});

export default app;
