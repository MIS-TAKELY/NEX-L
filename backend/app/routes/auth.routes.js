// app/routes/auth.routes.js
import { toNodeHandler } from "better-auth/node";
import express from "express";
import { auth } from "../lib/auth.js";

const router = express.Router();

router.get("/", (req, res) => {
    const { role } = req.query;
    if (role) {
        res.cookie("pending_role", role, {
            httpOnly: false,
            secure: true,
            sameSite: "none",
            path: "/",
            maxAge: 3600000, 
        });
    }
    res.status(200).send({ success: true, role });
});

export default router;