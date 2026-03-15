// app/routes/auth.routes.js
import { toNodeHandler } from "better-auth/node";
import express from "express";
import { auth } from "../lib/auth.js";

const router = express.Router();

router.get("/pre-social", (req, res) => {
    const { role } = req.query;
    console.log(`--- /pre-social called with role: ${role} ---`);
    if (role) {

        res.cookie("pending_role", role, {
            httpOnly: false, // Allow client side to verify if needed, but primary use is backend
            secure: process.env.NODE_ENV === "production",
            sameSite: "none",
            maxAge: 3600000, // 1 hour
        });
    }
    res.status(200).send({ success: true, role });
});

router.use(toNodeHandler(auth));

export default router;