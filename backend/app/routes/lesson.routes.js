import express from "express";
import {
  createLesson,
  getLessonsByCourse,
} from "../controllers/lesson.controller.js";

const router = express.Router();

router.post("/", createLesson);
router.get("/:courseId", getLessonsByCourse);

export default router;
router.get("/", (req, res) => {
  res.send("Lesson base route working ");
});
