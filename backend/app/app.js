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
import liveClassRouter from "../app/routes/live-class.routes.js";
import tutoringSessionRouter from "../app/routes/tutoring-session.routes.js";
import badgeRouter from "../app/routes/badge.routes.js";
import mergeRoleRouter from "../app/routes/merge-role.routes.js";
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

  // Serve an auto-redirecting page.
  const providerName = provider.charAt(0).toUpperCase() + provider.slice(1);
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Connecting to ${providerName}...</title>
        <style>
            body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background-color: #0c0c0e; color: #fff; text-align: center; }
            .loader { border: 3px solid rgba(255, 255, 255, 0.1); border-top: 3px solid #3b82f6; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 20px; }
            @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
            h2 { margin-top: 0; font-weight: 500; font-size: 1.5rem; }
            p { color: #a0a0a0; margin-top: 10px; }
        </style>
    </head>
    <body>
        <div>
            <div class="loader"></div>
            <h2>Connecting to ${providerName}...</h2>
            <p id="error-text" style="color: #ff4d4d; display: none;"></p>
        </div>
        <script>
          window.onload = function() {
            const errorText = document.getElementById('error-text');

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
                if (errorText) {
                  errorText.innerText = "Error: " + JSON.stringify(data);
                  errorText.style.display = 'block';
                }
              }
            })
            .catch(err => {
              if (errorText) {
                errorText.innerText = "Error connecting to server. Please try again.";
                errorText.style.display = 'block';
              }
              console.error(err);
            });
          };
        </script>
    </body>
    </html>
  `);
});

// other APIs
app.use("/api/v1/auth/pre-social", authRouter); // Only handle /pre-social here

// OAuth callback interceptor — runs BEFORE the general better-auth handler.
// We call auth.handler (Web API) directly so we can read the Response
// and append the session_token to the redirect URL before sending it.
// This bypasses the third-party cookie limitation between Render and Vercel.
const oauthCallbackHandler = async (req, res) => {
  const fullURL = `${(process.env.BETTER_AUTH_URL || "http://localhost:3000").replace(/\/+$/, "")}${req.originalUrl}`;

  // Build a Web API Request from the incoming Express request
  const headers = new Headers();
  Object.entries(req.headers).forEach(([k, v]) => {
    if (typeof v === "string") headers.set(k, v);
    else if (Array.isArray(v)) v.forEach((val) => headers.append(k, val));
  });

  const webReq = new Request(fullURL, { method: req.method, headers });

  // Let better-auth process the OAuth callback
  const webRes = await auth.handler(webReq);

  // Forward all response cookies and headers (except Location — we'll handle that)
  webRes.headers.forEach((value, name) => {
    if (name.toLowerCase() !== "location") {
      res.setHeader(name, value);
    }
  });

  const location = webRes.headers.get("location");
  if (location) {
    // Try to extract the session token from Set-Cookie
    const setCookieHeader = webRes.headers.get("set-cookie") || "";
    const tokenMatch = setCookieHeader.match(/better-auth\.session_token=([^;]+)/);
    let finalLocation = location;

    if (tokenMatch) {
      try {
        const redirectURL = new URL(location);
        redirectURL.searchParams.set("session_token", tokenMatch[1]);
        finalLocation = redirectURL.toString();
        console.log("[OAuth Interceptor] session_token appended to redirect:", finalLocation);
      } catch (e) {
        console.error("[OAuth Interceptor] Failed to modify redirect URL:", e);
      }
    } else {
      console.warn("[OAuth Interceptor] session_token NOT found in Set-Cookie. Cookies:", setCookieHeader);
    }

    res.writeHead(webRes.status, { location: finalLocation });
    res.end();
  } else {
    // Not a redirect — just forward the response body normally
    res.writeHead(webRes.status);
    const body = await webRes.text();
    res.end(body);
  }
};

app.get("/api/v1/auth/callback/google", oauthCallbackHandler);
app.get("/api/v1/auth/callback/github", oauthCallbackHandler);

// Custom routes must run before the Better Auth catch-all handler
app.use("/api/v1/auth", mergeRoleRouter);

// General Better Auth Handler for all other /api/v1/auth/* routes
app.use("/api/v1/auth", (req, res) => toNodeHandler(auth)(req, res));



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
app.use("/api/v1/live-classes", liveClassRouter);
app.use("/api/v1/tutoring-sessions", tutoringSessionRouter);
app.use("/api/v1/badges", badgeRouter);

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
