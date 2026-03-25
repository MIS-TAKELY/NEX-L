import Badge from "../models/badge.model.js";
import UserBadge from "../models/user-badge.model.js";
import Course from "../models/course.model.js";

// ─── Instructor: Create a badge for a course ────────────────────────────────
export const createBadge = async (req, res) => {
  try {
    const { name, description, type, threshold, level, icon, courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const badge = await Badge.create({
      name,
      description,
      type,
      threshold,
      level,
      icon,
      course: courseId,
    });

    res.status(201).json({ success: true, data: badge });
  } catch (err) {
    console.error("Error creating badge:", err);
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Public/Enrolled: Get all badges for a course ───────────────────────────
export const getBadgesByCourse = async (req, res) => {
  try {
    const badges = await Badge.find({ course: req.params.courseId, isActive: true }).lean();
    res.json({ success: true, data: badges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Student: Get all badges earned by the authenticated student ─────────────
export const getStudentBadges = async (req, res) => {
  try {
    const studentId = req.user.id;
    const userBadges = await UserBadge.find({ student: studentId })
      .populate({
        path: "badge",
        select: "name description type level icon threshold",
      })
      .populate("course", "title thumbnail")
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, data: userBadges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Student: Get badges earned for a specific course ────────────────────────
export const getStudentBadgesForCourse = async (req, res) => {
  try {
    const studentId = req.user.id;
    const userBadges = await UserBadge.find({
      student: studentId,
      course: req.params.courseId,
    })
      .populate("badge", "name description type level icon threshold")
      .lean();

    res.json({ success: true, data: userBadges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Instructor: Delete a badge ──────────────────────────────────────────────
export const deleteBadge = async (req, res) => {
  try {
    const badge = await Badge.findByIdAndDelete(req.params.id);
    if (!badge) return res.status(404).json({ success: false, message: "Badge not found" });

    // Also remove any user-badge records referencing this badge
    await UserBadge.deleteMany({ badge: req.params.id });

    res.json({ success: true, message: "Badge deleted" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── Instructor: Get all badges they created (across their courses) ──────────
export const getAllBadgesForInstructor = async (req, res) => {
  try {
    // Find courses belonging to this instructor
    const courses = await Course.find({ teacher: req.user.id }).select("_id").lean();
    const courseIds = courses.map((c) => c._id);

    const badges = await Badge.find({ course: { $in: courseIds } })
      .populate("course", "title thumbnail")
      .lean();

    res.json({ success: true, data: badges });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
