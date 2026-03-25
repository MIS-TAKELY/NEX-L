import mongoose from "mongoose";

const userBadgeSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    badge: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Badge",
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    // Context snapshot at the time of awarding
    awardedFor: {
      type: String, // e.g. "quiz_score: 92%", "assignment: 88%"
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

// Prevent awarding the same badge to the same student twice
userBadgeSchema.index({ student: 1, badge: 1 }, { unique: true });

const UserBadge = mongoose.model("UserBadge", userBadgeSchema);
export default UserBadge;
