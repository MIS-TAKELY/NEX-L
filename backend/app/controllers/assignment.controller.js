import Assignment from "../models/assignment.model.js";
import Course from "../models/course.model.js";

// Create assignment
export const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(400).json({ message: "Course not found" });

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      course: course._id
    });

    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Submit assignment
export const submitAssignment = async (req, res) => {
  try {
    const { assignmentId, studentId, fileUrl } = req.body;
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(400).json({ message: "Assignment not found" });

    assignment.submissions.push({ student: studentId, fileUrl, submittedAt: new Date() });
    await assignment.save();

    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all assignments
export const getAllAssignments = async (req, res) => {
  try {
    const assignments = await Assignment.find().populate("course");
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get assignments by course
export const getAssignmentsByCourse = async (req, res) => {
  try {
    const assignments = await Assignment.find({ course: req.params.courseId }).populate("course");
    res.json(assignments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get assignment by ID
export const getAssignmentById = async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id).populate("course");
    if (!assignment) return res.status(404).json({ message: "Assignment not found" });
    res.json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
