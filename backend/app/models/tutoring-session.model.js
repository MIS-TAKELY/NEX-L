import mongoose from "mongoose";

const tutoringSessionSchema = new mongoose.Schema(
  {
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    startTime: Date,
    endTime: Date,
    status: {
      type: String,
      enum: ["scheduled", "completed", "cancelled"],
      default: "scheduled",
    },
    notes: String,
  },
  {
    timestamps: true,
  },
);

const TutoringSession = mongoose.model("TutoringSession", tutoringSessionSchema);
export default TutoringSession;
