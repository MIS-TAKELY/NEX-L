import express from "express";

import authRouter from "./auth.routes.js";
import userRouter from "./user.routes.js";
import courseRouter from "./course.routes.js";
import lessonRouter from "./lesson.routes.js";
import assignmentRouter from "./assignment.routes.js";

const router = express.Router();

router.use("/auth", authRouter);
router.use("/users", userRouter);
router.use("/courses", courseRouter);
router.use("/lessons", lessonRouter);
router.use("/assignments", assignmentRouter);

export default router;
