import express from "express";
import {
  createAssignment,
  getAssignmentsByCourse,
} from "../controllers/assignment.controller.js";

const router = express.Router();

router.post("/", createAssignment);
router.get("/:courseId", getAssignmentsByCourse);

export default router;
