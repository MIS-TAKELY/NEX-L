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
            httpOnly: false,
            secure: true,
            sameSite: "none",
            path: "/", // Scoped to root
            maxAge: 3600000, 
        });
    }
    res.status(200).send({ success: true, role });
});

router.use(toNodeHandler(auth));

export default router;