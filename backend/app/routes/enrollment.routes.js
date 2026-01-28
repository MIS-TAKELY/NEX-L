import express from "express";
import {
  enrollInCourse,
  getUserEnrollments,
} from "../controllers/enrollment.controller.js";

const router = express.Router();

router.post("/", enrollInCourse);
router.get("/:userId", getUserEnrollments);

export default router;
