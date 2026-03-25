import express from "express";
import {
  enrollInCourse,
  getUserEnrollments,
  getInstructorStats,
  getInstructorStudents,
  markContentCompleted,
  getEnrollmentByCourse,
} from "../controllers/enrollment.controller.js";

const router = express.Router();

router.post("/", enrollInCourse);
router.get("/user/:userId", getUserEnrollments);
router.get("/instructor/:instructorId/stats", getInstructorStats);
router.get("/instructor/:instructorId/students", getInstructorStudents);
router.get("/get-by-course/:studentId/:courseId", getEnrollmentByCourse);
router.post("/mark-completed", markContentCompleted);
router.get("/:userId", getUserEnrollments); // Fallback for legacy frontend


export default router;
