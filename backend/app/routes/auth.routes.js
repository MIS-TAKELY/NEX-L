// app/routes/auth.routes.js
import { toNodeHandler } from "better-auth/node";
import express from "express";
import { auth } from "../lib/auth.js";

const router = express.Router();

router.use(toNodeHandler(auth));

export default router;
