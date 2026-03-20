import express from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import {
  createLiveClass,
  getCourseLiveClasses,
  getStudentUpcomingClasses,
  updateLiveClass,
  deleteLiveClass,
} from "../controllers/live-class.controller.js";

const router = express.Router();

// ─── Teacher routes ──────────────────────────────────────────────────────────
// POST /api/v1/live-classes/schedule  – Teacher schedules a class
router.post("/schedule", requireAuth, requireRole("instructor", "admin"), createLiveClass);

// PATCH /api/v1/live-classes/:classId  – Teacher updates a class
router.patch("/:classId", requireAuth, requireRole("instructor", "admin"), updateLiveClass);

// DELETE /api/v1/live-classes/:classId  – Teacher cancels a class
router.delete("/:classId", requireAuth, requireRole("instructor", "admin"), deleteLiveClass);

// ─── Shared routes ───────────────────────────────────────────────────────────
// GET /api/v1/live-classes/course/:courseId  – Get classes for a course
router.get("/course/:courseId", requireAuth, getCourseLiveClasses);

// GET /api/v1/live-classes/upcoming  – Get student's upcoming classes
router.get("/upcoming", requireAuth, getStudentUpcomingClasses);

export default router;
