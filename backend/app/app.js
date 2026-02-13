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

const app = express();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: true,
  }),
);

app.use(express.json());
app.use(cookieParser());


app.get("/", (req, res) => {
  res.send("NEX-L Backend is live! Redirecting you to the frontend...");
});

// other APIs
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/courses", courseRouter);
app.use("/api/v1/lessons", lessonRouter);
app.use("/api/v1/assignments", assignmentRouter);
app.use("/api/v1/test-mail", testMail);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/payments", paymentRouter);
app.use("/api/v1/cart", cartRouter);
app.use("/api/v1/enrollments", enrollmentRouter);

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
