import Assignment from "../models/assignment.model.js";
import Content from "../models/content.model.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
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
    const studentId = req.user?.id || req.user?._id;

    if (!studentId) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    let assignment = await Assignment.findById(assignmentId);

    // Allow students to submit using the parent content id as a fallback.
    // This repairs older course records where the content exists but the
    // assignment document was never linked or populated correctly.
    if (!assignment) {
      const content = await Content.findById(assignmentId).populate({
        path: "section",
        populate: {
          path: "course",
        },
      });

      if (content?.type === "assignment") {
        if (content.assignment) {
          assignment = await Assignment.findById(content.assignment);
        } else if (content.section?.course?._id || content.section?.course) {
          assignment = await Assignment.create({
            title: content.title,
            description: content.description || content.summary || "",
            course: content.section.course._id || content.section.course,
          });

          content.assignment = assignment._id;
          await content.save();
        }
      }
    }

    if (!assignment) return res.status(404).json({ success: false, message: "Assignment not found" });

    // Verify student is enrolled in the course
    const enrollment = await Enrollment.findOne({ student: studentId, course: assignment.course, status: "enrolled" });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: "You must be enrolled in this course to submit assignments" });
    }

    // Prevent duplicate submissions - update existing submission instead
    const existingSubmission = assignment.submissions.find(sub => sub.student.toString() === studentId.toString());
    
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

    if (existingSubmission) {
      existingSubmission.fileUrl = fileUrl || existingSubmission.fileUrl;
      existingSubmission.text = text || existingSubmission.text;
      existingSubmission.submittedAt = new Date();
      existingSubmission.grade = grade;
    } else {
      assignment.submissions.push({ 
          student: studentId, 
          fileUrl, 
          text,
          grade,
          submittedAt: new Date() 
      });
    }
    await assignment.save();

    // Track submission in enrollment (only for new submissions)
    if (!existingSubmission) {
      enrollment.assignmentsSubmitted.push({
        assignment: assignment._id,
        grade,
      });
      await enrollment.save();
    }

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

    res.json({
      success: true,
      data: assignment,
      submissionGrade: grade,
      maxScore: assignment.maxScore || 100,
      newBadges: newBadges.map((ub) => ub.badge),
    });
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

// Resolve an assignment from the owning content item.
// This is used by the student player to recover older records and to keep the
// assignment UI stable even when the assignment relation is not populated yet.
export const resolveAssignmentByContent = async (req, res) => {
  try {
    const { contentId } = req.params;

    const content = await Content.findById(contentId).populate({
      path: "section",
      populate: {
        path: "course",
      },
    });

    if (!content) {
      return res.status(404).json({ success: false, message: "Content not found" });
    }

    if (content.type !== "assignment") {
      return res.status(400).json({ success: false, message: "Content is not an assignment" });
    }

    let assignment = null;

    if (content.assignment) {
      assignment = await Assignment.findById(content.assignment);
    }

    if (!assignment && (content.section?.course?._id || content.section?.course)) {
      assignment = await Assignment.create({
        title: content.title,
        description: content.description || content.summary || "",
        course: content.section.course._id || content.section.course,
      });

      content.assignment = assignment._id;
      await content.save();
    }

    if (!assignment) {
      return res.status(404).json({ success: false, message: "Assignment not found" });
    }

    const populatedAssignment = await Assignment.findById(assignment._id).populate("course");

    return res.json({
      success: true,
      data: populatedAssignment,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
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
