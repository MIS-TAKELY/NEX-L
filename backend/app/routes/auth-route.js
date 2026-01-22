import express from "express";
import { auth } from "../lib/auth.js";

const router = express.Router();

router.use("/auth", auth.handler);

export default router;
