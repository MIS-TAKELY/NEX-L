import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";

// Enroll in a course
export const enrollInCourse = async (req, res) => {
  try {
    const { studentId, courseId, paymentId } = req.body;

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({ student: studentId, course: courseId });
    if (existingEnrollment) {
      return res.status(400).json({ message: "Student already enrolled in this course" });
    }

    const enrollment = new Enrollment({
      student: studentId,
      course: courseId,
      payment: paymentId || null,
    });

    await enrollment.save();

    // Also update course's enrollments array if it's used there
    await Course.findByIdAndUpdate(courseId, {
      $addToSet: { enrollments: studentId }
    });

    res.status(201).json({ message: "Enrollment successful", enrollment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Create a new enrollment (Legacy/Internal)
export const createEnrollment = async (req, res) => {
  try {
    const { studentId, courseId, paymentId } = req.body;

    const enrollment = new Enrollment({
      student: studentId,
      course: courseId,
      payment: paymentId || null,
    });

    await enrollment.save();

    res.status(201).json({ message: "Enrollment created", enrollment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Get all enrollments
export const getEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find()
      .populate("student", "name email")
      .populate("course", "title");

    res.json(enrollments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get enrollment by ID
export const getEnrollmentById = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate("student", "name email")
      .populate("course", "title");

    if (!enrollment)
      return res.status(404).json({ message: "Enrollment not found" });

    res.json(enrollment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete enrollment
export const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findByIdAndDelete(req.params.id);

    if (!enrollment)
      return res.status(404).json({ message: "Enrollment not found" });

    res.json({ message: "Enrollment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Update enrollment progress (optional)
export const updateProgress = async (req, res) => {
  try {
    const { progress } = req.body;
    const enrollment = await Enrollment.findByIdAndUpdate(
      req.params.id,
      { progress },
      { new: true },
    );

    if (!enrollment)
      return res.status(404).json({ message: "Enrollment not found" });

    res.json({ message: "Progress updated", enrollment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all enrollments for a specific user
export const getUserEnrollments = async (req, res) => {
  try {
    const { userId } = req.params;
    const enrollments = await Enrollment.find({ student: userId })
      .populate({
        path: "course",
        populate: {
          path: "teacher",
          select: "name email"
        }
      });

    res.json(enrollments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
