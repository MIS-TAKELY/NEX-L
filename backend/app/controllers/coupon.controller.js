import Coupon from "../models/coupon.model.js";
import Course from "../models/course.model.js";

// Create a new coupon
export const createCoupon = async (req, res) => {
  try {
    const { code, discount, type, courseId, expiry, maxUses, teacherId } = req.body;

    // Verify course exists and teacher owns it
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.teacher.toString() !== teacherId) {
      return res.status(403).json({ message: "You are not authorized to create coupons for this course" });
    }

    const coupon = await Coupon.create({
      code,
      discount,
      type,
      course: courseId,
      expiry,
      maxUses,
      createdBy: teacherId,
    });

    res.status(201).json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all coupons for a course
export const getCourseCoupons = async (req, res) => {
  try {
    const { courseId } = req.params;
    const coupons = await Coupon.find({ course: courseId });
    res.json(coupons);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update a coupon
export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { code, discount, type, expiry, maxUses, teacherId } = req.body;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (coupon.createdBy.toString() !== teacherId) {
      return res.status(403).json({ message: "You are not authorized to update this coupon" });
    }

    coupon.code = code || coupon.code;
    coupon.discount = discount !== undefined ? discount : coupon.discount;
    coupon.type = type || coupon.type;
    coupon.expiry = expiry || coupon.expiry;
    coupon.maxUses = maxUses !== undefined ? maxUses : coupon.maxUses;

    await coupon.save();
    res.json(coupon);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete a coupon
export const deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId } = req.query; // Or from body/header

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (coupon.createdBy.toString() !== teacherId) {
      return res.status(403).json({ message: "You are not authorized to delete this coupon" });
    }

    await Coupon.findByIdAndDelete(id);
    res.json({ message: "Coupon deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Validate a coupon
export const validateCoupon = async (req, res) => {
  try {
    const { code, courseId } = req.body;

    const coupon = await Coupon.findOne({ code, course: courseId });
    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    // Check expiry
    if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    // Check max uses
    if (coupon.maxUses && coupon.uses >= coupon.maxUses) {
      return res.status(400).json({ message: "Coupon use limit reached" });
    }

    res.json({
      valid: true,
      discount: coupon.discount,
      type: coupon.type,
      couponId: coupon._id
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
