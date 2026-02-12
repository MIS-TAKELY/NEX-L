import express from "express";
import {
    getCart,
    addToCart,
    removeFromCart,
    clearCart,
} from "../controllers/cart.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";

const router = express.Router();

// All cart routes require authentication
router.use(requireAuth);

router.get("/", getCart);
router.post("/add", addToCart);
router.delete("/remove/:courseId", removeFromCart);
router.delete("/clear", clearCart);

export default router;
