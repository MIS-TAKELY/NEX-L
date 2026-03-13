import express from "express";
import {
  createCoupon,
  getCourseCoupons,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
} from "../controllers/coupon.controller.js";

const router = express.Router();

router.post("/", createCoupon);
router.get("/course/:courseId", getCourseCoupons);
router.put("/:id", updateCoupon);
router.delete("/:id", deleteCoupon);
router.post("/validate", validateCoupon);

export default router;
