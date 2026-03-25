import express from "express";
import {
  createBadge,
  getBadgesByCourse,
  getStudentBadges,
  getStudentBadgesForCourse,
  deleteBadge,
  getAllBadgesForInstructor,
} from "../controllers/badge.controller.js";
import { auth, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Instructor routes
router.post("/", auth, authorize("instructor", "admin"), createBadge);
router.get("/instructor", auth, authorize("instructor", "admin"), getAllBadgesForInstructor);
router.delete("/:id", auth, authorize("instructor", "admin"), deleteBadge);

// Student routes
router.get("/my-badges", auth, authorize("student"), getStudentBadges);
router.get("/my-badges/:courseId", auth, authorize("student"), getStudentBadgesForCourse);

// Public/enrolled: get all badges for a course (students and instructors)
router.get("/course/:courseId", auth, getBadgesByCourse);

export default router;
