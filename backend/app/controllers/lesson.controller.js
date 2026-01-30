import Lesson from "../models/lesson.model.js";
import Course from "../models/course.model.js";

// Create a lesson
export const createLesson = async (req, res) => {
  try {
    const { title, contentUrl, courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(400).json({ message: "Course not found" });

    const lesson = await Lesson.create({ title, contentUrl, course: course._id });
    res.status(201).json(lesson);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all lessons for a course
export const getLessonsByCourse = async (req, res) => {
  try {
    const lessons = await Lesson.find({ course: req.params.courseId });
    res.json(lessons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
