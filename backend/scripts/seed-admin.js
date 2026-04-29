import dotenv from "dotenv";
import { dbConnect, client } from "../app/config/dbConnect.js";
import User from "../app/models/user.model.js";
import mongoose from "mongoose";

dotenv.config();

const adminEmail = "admin@gmail.com";
const adminPassword = "admin1234";

async function seedAdmin() {
  try {
    // 1. Connect to DB
    await dbConnect();
    console.log("Connected to MongoDB...");

    // 2. Dynamically import auth after DB is connected
    const { auth } = await import("../app/lib/auth.js");

    // 3. Check if user exists and delete to ensure clean better-auth state
    const existingUser = await User.findOne({ email: adminEmail });
    if (existingUser) {
      console.log("User exists, cleaning up for re-creation...");
      await User.deleteOne({ _id: existingUser._id });
      const db = client.db();
      await db.collection("account").deleteMany({ userId: existingUser._id.toString() });
      await db.collection("session").deleteMany({ userId: existingUser._id.toString() });
    }

    // 4. Create user via better-auth API
    console.log("Creating admin via Better Auth API...");
    const result = await auth.api.signUpEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
        name: "Super Admin",
      }
    });

    if (result) {
      console.log("User created in Better Auth.");
      
      // 5. Update role to admin
      const user = await User.findOne({ email: adminEmail });
      if (user) {
        user.role = "admin";
        user.roles = JSON.stringify(["admin"]);
        user.emailVerified = true;
        await user.save();
        console.log("User promoted to Admin successfully.");
      }
    }

    console.log("Seeding completed successfully.");
    process.exit(0);
  } catch (err) {
    console.error("Error seeding admin:", err);
    process.exit(1);
  }
}

seedAdmin();