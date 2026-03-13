import express from "express";
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
} from "../controllers/course.controller.js";

const router = express.Router();

router.post("/", createCourse);
router.get("/", getAllCourses);
router.get("/sections", getCourseSections);
router.get("/search", searchCoursesVector);
router.post("/record-view", recordCourseView);
router.get("/instructor/:teacherId", getInstructorCourses);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);
router.post("/generate-content", generateContent);

export default router;
