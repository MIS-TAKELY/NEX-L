import express from "express";
import {
  getAdminStats,
  getAllUsers,
  updateUserRole,
  getAdminCourses,
  updateCourseStatus,
  getSystemSettings,
  updateSystemSetting,
} from "../controllers/admin.controller.js";
import { requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All admin routes are protected by requireRole('admin')
router.use(requireRole("admin"));

router.get("/stats", getAdminStats);
router.get("/users", getAllUsers);
router.put("/users/:userId/role", updateUserRole);
router.get("/courses", getAdminCourses);
router.put("/courses/:courseId/status", updateCourseStatus);
router.get("/settings", getSystemSettings);
router.put("/settings", updateSystemSetting);

export default router;
