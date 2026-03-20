import TutoringSession from "../models/tutoring-session.model.js";
import User from "../models/user.model.js";

// Create a new tutoring session
export const createSession = async (req, res) => {
  try {
    const { studentId, courseId, startTime, endTime, notes } = req.body;
    const teacherId = req.user.id;

    const session = new TutoringSession({
      teacher: teacherId,
      student: studentId,
      course: courseId,
      startTime,
      endTime,
      notes,
    });

    await session.save();

    res.status(201).json({
      success: true,
      message: "Tutoring session created successfully",
      session,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error", error: err.message });
  }
};

// Get all sessions for a teacher
export const getTeacherSessions = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const sessions = await TutoringSession.find({ teacher: teacherId })
      .populate("student", "name email image")
      .populate("course", "title")
      .sort({ startTime: 1 });

    res.json({ success: true, sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Get all sessions for a student
export const getStudentSessions = async (req, res) => {
  try {
    const studentId = req.user.id;
    const sessions = await TutoringSession.find({ student: studentId })
      .populate("teacher", "name email image")
      .populate("course", "title")
      .sort({ startTime: 1 });

    res.json({ success: true, sessions });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Update session status
export const updateSessionStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const session = await TutoringSession.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );

    if (!session) {
      return res.status(404).json({ success: false, message: "Session not found" });
    }

    res.json({ success: true, message: "Session status updated", session });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
