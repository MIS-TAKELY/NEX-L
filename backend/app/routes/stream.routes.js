import express from "express";
import { requireAuth, requireRole } from "../middlewares/auth.middleware.js";
import {
  generateToken,
  generateVideoToken,
  getOrCreateDirectChannel,
  getOrCreateGroupChannel,
  createLiveStream,
  getLiveStream,
  createVideoCall,
} from "../controllers/stream.controller.js";

const router = express.Router();

// ── Chat Tokens ────────────────────────────────────────────────────────────
// POST /api/v1/stream/token  – any authenticated user
router.post("/token", requireAuth, generateToken);

// POST /api/v1/stream/video-token  – any authenticated user
router.post("/video-token", requireAuth, generateVideoToken);

// ── Direct Message Channel (student ↔ teacher) ────────────────────────────
// GET /api/v1/stream/dm/:courseId
router.get("/dm/:courseId", requireAuth, getOrCreateDirectChannel);

// ── Group Chat Channel (all course members) ───────────────────────────────
// GET /api/v1/stream/group/:courseId
router.get("/group/:courseId", requireAuth, getOrCreateGroupChannel);

// ── Live Stream ────────────────────────────────────────────────────────────
// POST /api/v1/stream/livestream/:courseId  (teacher only)
router.post("/livestream/:courseId", requireAuth, createLiveStream);

// GET /api/v1/stream/livestream/:courseId  (teacher + enrolled students)
router.get("/livestream/:courseId", requireAuth, getLiveStream);

// ── Video Call ─────────────────────────────────────────────────────────────
// POST /api/v1/stream/videocall/:courseId  (teacher + enrolled students)
router.post("/videocall/:courseId", requireAuth, createVideoCall);

export default router;
