import dotenv from "dotenv";
import mongoose from "mongoose";
import Course from "../app/models/course.model.js";
import Enrollment from "../app/models/enrollment.model.js";
import { dbConnect } from "../app/config/dbConnect.js";

dotenv.config();

async function syncEnrollments() {
  try {
    await dbConnect();
    console.log("Connected to database.");

    const enrollments = await Enrollment.find({});
    console.log(`Found ${enrollments.length} enrollments to sync.`);

    let syncedCount = 0;
    for (const enrollment of enrollments) {
      const course = await Course.findById(enrollment.course);
      if (course) {
        if (!course.enrollments.includes(enrollment._id)) {
          course.enrollments.push(enrollment._id);
          await course.save();
          syncedCount++;
        }
      }
    }

    console.log(`Successfully synced ${syncedCount} enrollments to courses.`);
    process.exit(0);
  } catch (error) {
    console.error("Sync failed:", error);
    process.exit(1);
  }
}

syncEnrollments();
