import Course from "../models/course.model.js";
import User from "../models/user.model.js";

// Create a new course
export const createCourse = async (req, res) => {
  try {
    const { title, description, teacherId, tags, category, price, isFree } = req.body;

    // Check if teacher exists
    const teacher = await User.findById(teacherId);
    if (!teacher) return res.status(400).json({ message: "Teacher not found" });

    const course = await Course.create({
      title,
      description,
      teacher: teacher._id, // matches schema
      tags,
      category,
      price,
      isFree,
    });

    res.status(201).json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find()
      .populate("teacher")      // matches schema
      .populate("enrollments"); // if you want to show enrolled students via enrollments

    res.json(courses);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get single course by ID
export const getCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id)
      .populate("teacher")
      .populate("enrollments");

    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Enroll student in course
export const enrollStudent = async (req, res) => {
  try {
    const { courseId, studentId } = req.body;

    const course = await Course.findById(courseId);
    const student = await User.findById(studentId);

    if (!course || !student) {
      return res.status(400).json({ message: "Course or student not found" });
    }

    // Optional: check if already enrolled
    if (course.enrollments.includes(student._id)) {
      return res.status(400).json({ message: "Student already enrolled" });
    }

    // Push student ID into enrollments array (or you can create a separate Enrollment model)
    course.enrollments.push(student._id);
    await course.save();

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
