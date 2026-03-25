import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    // The criterion category for this badge
    type: {
      type: String,
      enum: ["quiz_score", "assignment", "participation", "course_completion"],
      required: true,
    },
    // Minimum percentage (0-100) required to earn this badge
    threshold: { type: Number, required: true, min: 0, max: 100 },
    level: { type: String, enum: ["bronze", "silver", "gold"], default: "bronze" },
    // Emoji or icon identifier shown in the UI
    icon: { type: String, default: "🏅" },
    // Legacy image field kept for compatibility
    image: { type: String },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

const Badge = mongoose.model("Badge", badgeSchema);
export default Badge;
