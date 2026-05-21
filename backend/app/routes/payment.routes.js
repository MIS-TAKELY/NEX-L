import express from "express";
import {
    initiateEsewaPayment,
    verifyEsewaPayment,
    initiateKhaltiPayment,
    verifyKhaltiPayment,
} from "../controllers/payment.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Initiate endpoints require authentication (user must be logged in to pay)
router.post("/esewa/initiate", requireAuth, initiateEsewaPayment);
router.post("/khalti/initiate", requireAuth, initiateKhaltiPayment);

// Verify endpoints are callbacks from payment gateways (redirect URLs) — no auth headers available
router.get("/esewa/verify", verifyEsewaPayment);
router.get("/khalti/verify", verifyKhaltiPayment);

export default router;
