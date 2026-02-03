import express from "express";
import { testMail } from "../controllers/test-mail.controller.js";

const router = express.Router();

router.post("/", testMail);

export default router;
