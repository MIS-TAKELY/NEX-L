import User from "../models/user.model.js";
import Course from "../models/course.model.js";
import Enrollment from "../models/enrollment.model.js";
import SystemSetting from "../models/system-setting.model.js";

// Get dashboard stats
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalCourses = await Course.countDocuments();
    const pendingCourses = await Course.countDocuments({ status: "pending" });
    const totalEnrollments = await Enrollment.countDocuments();

    // Simple revenue calculation if payment model exists
    // For now, let's just return these basic stats
    res.json({
      totalUsers,
      totalCourses,
      pendingCourses,
      totalEnrollments,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List all users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;
    const query = search
      ? {
          $or: [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const users = await User.find(query)
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 });

    const count = await User.countDocuments(query);

    res.json({
      users,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      totalUsers: count,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update user role (supports adding to multiple roles)
export const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { role } = req.body;

    if (!["student", "teacher", "instructor", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Parse existing roles
    let roles = [];
    try {
      roles = JSON.parse(user.roles || "[]");
    } catch (e) {
      roles = user.role ? [user.role] : [];
    }

    // Add new role if not exists
    if (!roles.includes(role)) {
      roles.push(role);
    }

    user.role = role; // Set as primary role
    user.roles = JSON.stringify(roles);
    await user.save();

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// List all courses for admin (including pending)
export const getAdminCourses = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search = "" } = req.query;
    const query = {};
    if (status) query.status = status;
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const courses = await Course.find(query)
      .populate("teacher", "name email")
      .limit(limitNum)
      .skip((pageNum - 1) * limitNum)
      .sort({ createdAt: -1 });

    const count = await Course.countDocuments(query);

    res.json({
      courses,
      totalPages: Math.ceil(count / limitNum),
      currentPage: pageNum,
      totalCourses: count,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Approve or Reject course
export const updateCourseStatus = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { status } = req.body;

    if (!["published", "archived", "pending", "draft"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const course = await Course.findByIdAndUpdate(courseId, { status }, { new: true });
    if (!course) return res.status(404).json({ message: "Course not found" });

    res.json(course);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all system settings
export const getSystemSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.find();
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a system setting
export const updateSystemSetting = async (req, res) => {
  try {
    const { key, value } = req.body;
    const setting = await SystemSetting.findOneAndUpdate(
      { key },
      { value },
      { new: true, upsert: true }
    );
    res.json(setting);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
