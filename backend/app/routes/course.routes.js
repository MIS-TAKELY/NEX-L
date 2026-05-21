import express from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import {
  createCourse,
  getAllCourses,
  getCourseSections,
  recordCourseView,
  searchCoursesVector,
  getCourseById,
  getInstructorCourses,
  updateCourse,
  deleteCourse,
  generateContent,
  getInstructorAnalytics,
  summarizeContent,
  askAIContent,
  rateCourse,
} from "../controllers/course.controller.js";

const router = express.Router();

router.post("/", requireRole("instructor", "admin"), createCourse);
router.get("/", getAllCourses);
router.get("/sections", getCourseSections);
router.get("/search", searchCoursesVector);
router.post("/record-view", requireAuth, recordCourseView);
router.get("/instructor/:teacherId", getInstructorCourses);
router.get("/instructor/:teacherId/analytics", requireAuth, getInstructorAnalytics);
router.get("/:id", getCourseById);
router.put("/:id", requireRole("instructor", "admin"), updateCourse);
router.delete("/:id", requireRole("instructor", "admin"), deleteCourse);
router.post("/generate-content", requireRole("instructor", "admin"), generateContent);
router.post("/summarize-content", requireAuth, summarizeContent);
router.post("/ask-ai", requireAuth, askAIContent);
router.post("/:id/rate", requireAuth, rateCourse);

export default router;
