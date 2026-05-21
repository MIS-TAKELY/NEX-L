import Assignment from "../models/assignment.model.js";
import Course from "../models/course.model.js";
import getEmbedding from "../utils/embedding.js";
import { checkAndAwardBadges } from "../utils/badge.service.js";
import { parseRolesFromUser } from "../lib/roles.js";

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
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // Verify course exists and instructor owns it (or is admin)
    const course = await Course.findById(courseId);
    if (!course) return res.status(400).json({ message: "Course not found" });

    const userRoles = parseRolesFromUser(req.user);
    const isAdmin = userRoles.includes("admin");
    if (!isAdmin && course.teacher.toString() !== userId.toString()) {
      return res.status(403).json({ message: "Forbidden: You can only create assignments for your own courses" });
    }

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

    // ── Badge evaluation ──────────────────────────────────────────────────────
    let newBadges = [];
    if (grade !== null) {
      const gradePercentage = ((grade / (assignment.maxScore || 100)) * 100);
      try {
        newBadges = await checkAndAwardBadges(studentId, assignment.course, {
          assignmentGrade: gradePercentage,
        });
      } catch (badgeErr) {
        console.error("[Badge] Error during badge evaluation:", badgeErr.message);
      }
    }

    res.json({ success: true, data: assignment, newBadges: newBadges.map((ub) => ub.badge) });
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

// Get submissions for an assignment (instructor only)
export const getSubmissions = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user?.id || req.user?._id;

    const assignment = await Assignment.findById(assignmentId).populate({
      path: "submissions.student",
      select: "name email image",
    });

    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    // Verify the instructor owns the course this assignment belongs to
    const course = await Course.findById(assignment.course);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const userRoles = parseRolesFromUser(req.user);
    const isAdmin = userRoles.includes("admin");
    const isOwner = course.teacher.toString() === userId.toString();
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: You can only view submissions for your own courses" });
    }

    res.json({
      success: true,
      data: {
        assignment: {
          _id: assignment._id,
          title: assignment.title,
          description: assignment.description,
          dueDate: assignment.dueDate,
          maxScore: assignment.maxScore,
          autoGrade: assignment.autoGrade,
          gradingCriteria: assignment.gradingCriteria,
        },
        submissions: assignment.submissions,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// Grade a submission (instructor only)
export const gradeSubmission = async (req, res) => {
  try {
    const { assignmentId, submissionId } = req.params;
    const { grade } = req.body;
    const userId = req.user?.id || req.user?._id;

    if (grade === undefined || grade === null) {
      return res.status(400).json({ success: false, message: "Grade is required" });
    }

    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    // Verify the instructor owns the course
    const course = await Course.findById(assignment.course);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const userRoles = parseRolesFromUser(req.user);
    const isAdmin = userRoles.includes("admin");
    const isOwner = course.teacher.toString() === userId.toString();
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: "Forbidden: You can only grade submissions for your own courses" });
    }

    // Find and update the specific submission
    const submission = assignment.submissions.id(submissionId);
    if (!submission) {
      return res.status(404).json({ success: false, message: "Submission not found" });
    }

    submission.grade = Number(grade);
    await assignment.save();

    res.json({
      success: true,
      message: "Submission graded successfully",
      data: {
        submissionId: submission._id,
        grade: submission.grade,
      },
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
