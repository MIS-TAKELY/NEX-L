import express from "express";
import {
  createCoupon,
  getCourseCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/coupon.controller.js";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Management routes — only instructors/admins can create, update, delete coupons
router.post("/", requireAuth, requireRole("instructor", "admin"), createCoupon);
router.put("/:id", requireAuth, requireRole("instructor", "admin"), updateCoupon);
router.delete("/:id", requireAuth, requireRole("instructor", "admin"), deleteCoupon);

// Read/validate routes — any authenticated user
router.get("/course/:courseId", requireAuth, getCourseCoupons);
router.post("/validate", requireAuth, validateCoupon);

export default router;
