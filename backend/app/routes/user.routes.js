import express from "express";
import {
  getMyProfile,
  getUserById,
} from "../controllers/user.controller.js";

const router = express.Router();

router.get("/me", getMyProfile);
router.get("/:id", getUserById);

export default router;
