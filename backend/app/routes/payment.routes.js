import express from "express";
import {
    initiateEsewaPayment,
    verifyEsewaPayment,
    initiateKhaltiPayment,
    verifyKhaltiPayment,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/esewa/initiate", initiateEsewaPayment);
router.get("/esewa/verify", verifyEsewaPayment);
router.post("/khalti/initiate", initiateKhaltiPayment);
router.get("/khalti/verify", verifyKhaltiPayment);

export default router;
