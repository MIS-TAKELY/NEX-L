import express from "express";
import { createQuiz, getQuizById, submitQuiz, getQuizSubmissions } from "../controllers/quiz.controller.js";
import { auth, authorize } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Routes for quizzes
router.post("/", auth, authorize("instructor", "admin"), createQuiz);
router.get("/:id", auth, getQuizById);
router.post("/:id/submit", auth, authorize("student"), submitQuiz);
router.get("/:quizId/submissions", auth, authorize("instructor", "admin"), getQuizSubmissions);

export default router;
