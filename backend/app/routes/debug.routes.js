import express from "express";
import { client } from "../config/dbConnect.js";

const router = express.Router();

function redactUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

router.get("/auth-user", async (req, res) => {
  if (process.env.NODE_ENV === "production") {
    return res.status(404).json({ message: "Not found" });
  }

  try {
    const email = String(req.query.email || "").trim().toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "email query param is required" });
    }

    const db = client.db();
    const exactUser = await db.collection("user").findOne({ email });
    const ciUser = exactUser
      ? exactUser
      : await db.collection("user").findOne({
          email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
        });

    const userId = exactUser?._id?.toString() || ciUser?._id?.toString() || null;
    const accounts = userId ? await db.collection("account").find({ userId }).toArray() : [];
    const sessions = userId ? await db.collection("session").find({ userId }).toArray() : [];
    const verifications = userId
      ? await db
          .collection("verification")
          .find({
            value: userId,
            identifier: { $regex: "^reset-password:" },
          })
          .toArray()
      : [];

    return res.status(200).json({
      query: email,
      exactUser: redactUser(exactUser),
      caseInsensitiveUser: exactUser ? null : redactUser(ciUser),
      userId,
      accounts,
      sessions,
      verifications,
    });
  } catch (error) {
    console.error("/debug/auth-user failed:", error);
    return res.status(500).json({ message: "Failed to inspect auth user", error: error.message });
  }
});

export default router;
