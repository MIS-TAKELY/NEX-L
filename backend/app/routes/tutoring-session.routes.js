import express from "express";
import {
  createSession,
  getTeacherSessions,
  getStudentSessions,
  updateSessionStatus,
} from "../controllers/tutoring-session.controller.js";
import { auth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", auth, createSession);
router.get("/teacher", auth, getTeacherSessions);
router.get("/student", auth, getStudentSessions);
router.patch("/:id/status", auth, updateSessionStatus);

export default router;
