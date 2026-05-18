import dotenv from "dotenv";
import { dbConnect, client } from "../app/config/dbConnect.js";

dotenv.config();

function usage() {
  console.log("Usage: node scripts/debug-auth-user.js <email>");
}

function normalizeEmail(email) {
  return typeof email === "string" ? email.trim().toLowerCase() : "";
}

function redactUser(user) {
  if (!user) return null;
  const { password, ...rest } = user;
  return rest;
}

async function run() {
  const email = normalizeEmail(process.argv[2]);
  if (!email) {
    usage();
    process.exit(1);
  }

  await dbConnect();
  const db = client.db();

  const userExact = await db.collection("user").findOne({ email });
  const userCaseInsensitive = userExact
    ? userExact
    : await db.collection("user").findOne({
        email: { $regex: `^${email.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" },
      });

  console.log("Query email:", email);
  console.log("");
  console.log("User (exact match):");
  console.log(JSON.stringify(redactUser(userExact), null, 2));
  console.log("");

  if (!userExact && userCaseInsensitive) {
    console.log("User (case-insensitive match):");
    console.log(JSON.stringify(redactUser(userCaseInsensitive), null, 2));
    console.log("");
  }

  const userId = userExact?._id?.toString() || userCaseInsensitive?._id?.toString() || null;

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

  console.log("User ID:", userId || "(not found)");
  console.log("");
  console.log("Accounts:");
  console.log(JSON.stringify(accounts, null, 2));
  console.log("");
  console.log("Sessions:");
  console.log(JSON.stringify(sessions, null, 2));
  console.log("");
  console.log("Reset verifications:");
  console.log(JSON.stringify(verifications, null, 2));

  process.exit(0);
}

run().catch((err) => {
  console.error("debug-auth-user failed:", err);
  process.exit(1);
});
