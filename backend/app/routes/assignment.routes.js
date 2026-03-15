import express from "express";
import {
  createAssignment,
  getAssignmentsByCourse,
  submitAssignment,
} from "../controllers/assignment.controller.js";
import { auth, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", auth, authorize("instructor", "admin"), createAssignment);
router.get("/:courseId", auth, getAssignmentsByCourse);
router.post("/:id/submit", auth, authorize("student"), submitAssignment);

export default router;
