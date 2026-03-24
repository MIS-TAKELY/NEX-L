import express from "express";
import {
  getMyProfile,
  getUserById,
  updateUser,
} from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/me", requireAuth, getMyProfile);
router.put("/me", requireAuth, updateUser);
router.get("/:id", getUserById);

export default router;
