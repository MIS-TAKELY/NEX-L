import express from "express";
import {
  enrollInCourse,
  getUserEnrollments,
  getInstructorStats,
  getInstructorStudents,
} from "../controllers/enrollment.controller.js";

const router = express.Router();

router.post("/", enrollInCourse);
router.get("/user/:userId", getUserEnrollments);
router.get("/instructor/:instructorId/stats", getInstructorStats);
router.get("/instructor/:instructorId/students", getInstructorStudents);

export default router;
