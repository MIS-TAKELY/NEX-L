import mongoose from "mongoose";

const sectionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    contents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Content",
      },
    ],
    order: Number, 
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Section", sectionSchema);
