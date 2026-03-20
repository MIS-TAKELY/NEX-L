import mongoose from "mongoose";

const liveClassSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course is required"],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Teacher is required"],
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
    },
    startTime: {
      type: Date,
      required: [true, "Start time is required"],
    },
    duration: {
      type: Number, // in minutes
      default: 60,
    },
    status: {
      type: String,
      enum: ["scheduled", "live", "completed", "cancelled"],
      default: "scheduled",
    },
    meetingId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const LiveClass = mongoose.model("LiveClass", liveClassSchema);
export default LiveClass;
