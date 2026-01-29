import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
import courseRouter from "./course.routes.js";
import lessonRouter from "./lesson.routes.js";
import assignmentRouter from "./assignment.routes.js";

export default function routes(app) {
  app.use("/api/auth", authRouter);
  app.use("/api/users", userRouter);
  app.use("/api/courses", courseRouter);
  app.use("/api/lessons", lessonRouter);
  app.use("/api/assignments", assignmentRouter);
}

