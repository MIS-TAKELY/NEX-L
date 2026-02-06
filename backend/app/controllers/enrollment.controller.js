import Enrollment from "../models/enrollment.model.js";

// Create a new enrollment
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
