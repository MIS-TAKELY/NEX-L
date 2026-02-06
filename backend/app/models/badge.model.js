import mongoose from "mongoose";

const badgeSchema = new mongoose.Schema(
  {
    name: String,
    description: String,
    criteria: String,
    level: { type: String, enum: ["bronze", "silver", "gold"] },
    image: String,
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  },
  {
    timestamps: true,
  },
);

const Badge = mongoose.model("Badge", badgeSchema);
export default Badge;
