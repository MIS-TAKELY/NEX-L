import Assignment from "../models/assignment.model.js";
import Course from "../models/course.model.js";
import getEmbedding from "../utils/embedding.js";

// Helper for cosine similarity
const cosineSimilarity = (vecA, vecB) => {
    const dotProduct = vecA.reduce((sum, a, i) => sum + a * vecB[i], 0);
    const magA = Math.sqrt(vecA.reduce((sum, a) => sum + a * a, 0));
    const magB = Math.sqrt(vecB.reduce((sum, b) => sum + b * b, 0));
    return dotProduct / (magA * magB);
};

// Create assignment
export const createAssignment = async (req, res) => {
  try {
    const { title, description, dueDate, courseId, autoGrade, gradingCriteria, maxScore } = req.body;
    const course = await Course.findById(courseId);
    if (!course) return res.status(400).json({ message: "Course not found" });

    const assignment = await Assignment.create({
      title,
      description,
      dueDate,
      course: course._id,
      autoGrade,
      gradingCriteria,
      maxScore
    });

    res.status(201).json(assignment);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Submit assignment
export const submitAssignment = async (req, res) => {
  try {
    const { fileUrl, text } = req.body;
    const assignmentId = req.params.id;
    const studentId = req.user.id; // From auth middleware

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });

    let grade = null;
    if (assignment.autoGrade && text && assignment.gradingCriteria) {
        try {
            const [studentEmb, criteriaEmb] = await Promise.all([
                getEmbedding(text),
                getEmbedding(assignment.gradingCriteria)
            ]);
            const similarity = cosineSimilarity(studentEmb, criteriaEmb);
            grade = Math.round(similarity * (assignment.maxScore || 100));
        } catch (error) {
            console.error("AI Evaluation failed:", error);
        }
    }

    assignment.submissions.push({ 
        student: studentId, 
        fileUrl, 
        text,
        grade,
        submittedAt: new Date() 
    });
    await assignment.save();

    res.json({ success: true, data: assignment });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
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
