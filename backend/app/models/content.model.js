import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "pdf", "note", "link", "article", "mixed", "image", "file", "quiz", "assignment"],
      required: true,
    },
    url: {
      type: String,
    },
    summary: String,
    description: String,

    duration: Number,
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
    },
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz"
    },
    assignment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Assignment"
    },
    resources: [
      {
        url: String,
        type: { type: String }, // Explicitly define type within the object
        name: String,
        size: Number,
        duration: Number,
        thumbnail: String,
      },
    ],
    isPreview: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model("Content", contentSchema);
