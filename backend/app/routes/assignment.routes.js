import express from "express";
import {
  createAssignment,
  getAssignmentsByCourse,
  submitAssignment,
  getSubmissions,
  gradeSubmission,
} from "../controllers/assignment.controller.js";
import { auth, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", auth, authorize("instructor", "admin"), createAssignment);
router.get("/:courseId", auth, getAssignmentsByCourse);
router.post("/:id/submit", auth, authorize("student"), submitAssignment);
router.get("/:assignmentId/submissions", auth, authorize("instructor", "admin"), getSubmissions);
router.put("/:assignmentId/submissions/:submissionId/grade", auth, authorize("instructor", "admin"), gradeSubmission);

export default router;
