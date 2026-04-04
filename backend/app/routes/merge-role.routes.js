import express from "express";
import { ObjectId } from "mongodb";
import { verifyPassword } from "better-auth/crypto";
import { client } from "../config/dbConnect.js";
import { isAppRole, mergeRolesJson, normalizeRole, parseRolesFromUser } from "../lib/roles.js";

const router = express.Router();

/**
 * Add student/instructor to an existing email account after password check.
 * Used when sign-up fails because the email already exists.
 */
router.post("/merge-role", async (req, res) => {
  try {
    const { email, password, role } = req.body || {};
    const r = normalizeRole(role);
    if (!email || !password || !r || !isAppRole(r) || r === "admin") {
      return res.status(400).json({ message: "Invalid request" });
    }

    const emailLower = String(email).trim().toLowerCase();
    const db = client.db();
    const user = await db.collection("user").findOne({ email: emailLower });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const existing = parseRolesFromUser(user);
    if (existing.includes(r)) {
      return res.status(200).json({ ok: true, roles: existing, alreadyHadRole: true });
    }

    const orUser = [];
    if (user._id) {
      orUser.push({ userId: user._id });
      orUser.push({ userId: user._id.toString() });
    }
    if (user.id) {
      orUser.push({ userId: user.id });
      if (ObjectId.isValid(String(user.id))) {
        try {
          orUser.push({ userId: new ObjectId(String(user.id)) });
        } catch {
          /* ignore */
        }
      }
    }

    if (!orUser.length) {
      return res.status(400).json({ message: "Invalid user record" });
    }

    const account = await db.collection("account").findOne({
      providerId: "credential",
      $or: orUser,
    });

    if (!account?.password) {
      return res.status(400).json({
        message:
          "This email is registered with social login only. Sign in with Google or GitHub, then add the other role from account settings when available.",
      });
    }

    const valid = await verifyPassword({ hash: account.password, password });
    if (!valid) {
      return res.status(401).json({ message: "Invalid password" });
    }

    const mergedJson = mergeRolesJson(user.roles ?? null, r);
    const list = parseRolesFromUser({ roles: mergedJson, role: user.role });

    await db.collection("user").updateOne(
      { _id: user._id },
      {
        $set: {
          roles: mergedJson,
          role: r,
          updatedAt: new Date(),
        },
      },
    );

    return res.status(200).json({ ok: true, roles: list });
  } catch (e) {
    console.error("merge-role:", e);
    return res.status(500).json({ message: "Server error" });
  }
});

export default router;
