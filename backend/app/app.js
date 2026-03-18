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

// other APIs
app.use("/api/v1/auth/pre-social", authRouter); // Only handle /pre-social here

// Better Auth Handler - Mounted at the base path
// We use a middleware to ensure path compatibility
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
