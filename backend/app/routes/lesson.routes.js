import express from "express";
import {
  createLesson,
  getLessonsByCourse,
} from "../controllers/lesson.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", requireAuth, requireRole("instructor", "admin"), createLesson);
router.get("/:courseId", requireAuth, getLessonsByCourse);

export default router;
