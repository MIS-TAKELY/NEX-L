import LiveClass from "../models/live-class.model.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";

// ─── Helper: check enrollment ───────────────────────────────────────────────
const isEnrolled = async (studentId, courseId) => {
  const enrollment = await Enrollment.findOne({
    student: studentId,
    course: courseId,
    status: "enrolled",
  });
  return !!enrollment;
};

// ─── Create Live Class (teacher only) ───────────────────────────────────────
export const createLiveClass = async (req, res) => {
  try {
    const { courseId, title, description, startTime, duration } = req.body;
    const teacherId = req.user.id;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (String(course.teacher) !== teacherId) {
      return res.status(403).json({ message: "Only the course instructor can schedule live classes" });
    }

    const liveClass = new LiveClass({
      course: courseId,
      teacher: teacherId,
      title,
      description,
      startTime,
      duration,
      meetingId: `live-${courseId}`, // Using the deterministic callId for now
    });

    await liveClass.save();

    res.status(201).json({
      message: "Live class scheduled successfully",
      liveClass,
    });
  } catch (error) {
    console.error("createLiveClass error:", error);
    res.status(500).json({ message: error.message || "Failed to schedule live class" });
  }
};

// ─── Get all scheduled classes for a course ──────────────────────────────────
export const getCourseLiveClasses = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    const isTeacher = String(course.teacher) === user.id;
    const enrolled = await isEnrolled(user.id, courseId);

    if (!isTeacher && !enrolled) {
      return res.status(403).json({ message: "Access denied. Purchase the course first." });
    }

    const liveClasses = await LiveClass.find({ course: courseId }).sort({ startTime: 1 });
    res.json(liveClasses);
  } catch (error) {
    console.error("getCourseLiveClasses error:", error);
    res.status(500).json({ message: "Failed to fetch live classes" });
  }
};

// ─── Get upcoming live classes for student ───────────────────────────────────
export const getStudentUpcomingClasses = async (req, res) => {
  try {
    const studentId = req.user.id;

    // Find all active enrollments for the student
    const enrollments = await Enrollment.find({
      student: studentId,
      status: "enrolled",
    }).select("course");

    const courseIds = enrollments.map((e) => e.course);

    const upcomingClasses = await LiveClass.find({
      course: { $in: courseIds },
      startTime: { $gte: new Date() },
    })
      .populate("course", "title thumbnail")
      .populate("teacher", "name image")
      .sort({ startTime: 1 });

    res.json(upcomingClasses);
  } catch (error) {
    console.error("getStudentUpcomingClasses error:", error);
    res.status(500).json({ message: "Failed to fetch upcoming classes" });
  }
};

// ─── Update Live Class (teacher only) ─────────────────────────────────────────
export const updateLiveClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { title, description, startTime, duration, status } = req.body;
    const teacherId = req.user.id;

    const liveClass = await LiveClass.findById(classId);
    if (!liveClass) return res.status(404).json({ message: "Live class not found" });

    if (String(liveClass.teacher) !== teacherId) {
      return res.status(403).json({ message: "Access denied" });
    }

    liveClass.title = title || liveClass.title;
    liveClass.description = description || liveClass.description;
    liveClass.startTime = startTime || liveClass.startTime;
    liveClass.duration = duration || liveClass.duration;
    liveClass.status = status || liveClass.status;

    await liveClass.save();

    res.json({
      message: "Live class updated successfully",
      liveClass,
    });
  } catch (error) {
    console.error("updateLiveClass error:", error);
    res.status(500).json({ message: "Failed to update live class" });
  }
};

// ─── Delete Live Class (teacher only) ─────────────────────────────────────────
export const deleteLiveClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const teacherId = req.user.id;

    const liveClass = await LiveClass.findById(classId);
    if (!liveClass) return res.status(404).json({ message: "Live class not found" });

    if (String(liveClass.teacher) !== teacherId) {
      return res.status(403).json({ message: "Access denied" });
    }

    await liveClass.deleteOne();

    res.json({ message: "Live class cancelled successfully" });
  } catch (error) {
    console.error("deleteLiveClass error:", error);
    res.status(500).json({ message: "Failed to delete live class" });
  }
};
