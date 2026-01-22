import express from "express";
import { auth } from "../lib/auth.js";

const authRouter = express.Router();

authRouter.all("/auth/*", auth);

export default authRouter;
