import mongoose from "mongoose";
import dotenv from "dotenv";
import Course from "../app/models/course.model.js";
import User from "../app/models/user.model.js";
import Enrollment from "../app/models/enrollment.model.js";

dotenv.config();

async function run() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ status: "published" });
    const totalEnrollments = await Enrollment.countDocuments();
    console.log("Total courses:", totalCourses);
    console.log("Published courses:", publishedCourses);
    console.log("Total enrollments:", totalEnrollments);

    const activeInstructors = await Course.aggregate([
      { $match: { status: "published" } },
      {
        $group: {
          _id: "$teacher",
          courseCount: { $sum: 1 },
          avgRating: { $avg: "$ratings.average" },
        },
      },
      { $sort: { courseCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: "user",
          localField: "_id",
          foreignField: "_id",
          as: "instructor",
        },
      },
      { $unwind: "$instructor" },
      {
        $project: {
          _id: 0,
          name: "$instructor.name",
          image: "$instructor.image",
          courseCount: 1,
          avgRating: { $ifNull: ["$avgRating", 0] },
        },
      },
    ]);

    console.log("Active Instructors from aggregation:", JSON.stringify(activeInstructors, null, 2));

    if (activeInstructors.length === 0) {
        console.log("Checking if there are any teachers at all...");
        const sampleCourse = await Course.findOne({ status: "published" });
        if (sampleCourse) {
            console.log("Sample published course teacher ID:", sampleCourse.teacher);
            const teacher = await User.findById(sampleCourse.teacher);
            console.log("Teacher found in 'user' collection:", teacher ? "Yes" : "No");
            if (!teacher) {
                const rawUser = await mongoose.connection.db.collection("users").findOne({ _id: sampleCourse.teacher });
                console.log("Teacher found in 'users' collection (raw):", rawUser ? "Yes" : "No");
            }
        }
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

run();
