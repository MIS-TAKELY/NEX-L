import express from "express";
import {
  createCourse,
  getAllCourses,
  getCourseById,
  getInstructorCourses,
  updateCourse,
  deleteCourse,
} from "../controllers/course.controller.js";

const router = express.Router();

router.post("/", createCourse);
router.get("/", getAllCourses);
router.get("/instructor/:teacherId", getInstructorCourses);
router.get("/:id", getCourseById);
router.put("/:id", updateCourse);
router.delete("/:id", deleteCourse);

export default router;
