import Course from "../models/course.js";
import User from "../models/user.js";

// Create a new course
export const createCourse = async (req, res) => {
  try {
    const { title, description, instructorId } = req.body;
    const instructor = await User.findById(instructorId);
    if (!instructor) return res.status(400).json({ message: "Instructor not found" });

    const course = await Course.create({
      title,
      description,
      instructor: instructor._id
    });
    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all courses
export const getCourses = async (req, res) => {
  try {
    const courses = await Course.find().populate("instructor").populate("students");
    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add student to course
export const enrollStudent = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;
    const course = await Course.findById(courseId);
    const student = await User.findById(studentId);
    if (!course || !student) return res.status(400).json({ message: "Course or student not found" });

    course.students.push(student._id);
    await course.save();
    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
