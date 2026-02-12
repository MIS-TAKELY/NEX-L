import mongoose from "mongoose";

const contentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["video", "pdf", "note", "link", "article", "mixed", "image", "file"],
      required: true,
    },
    url: {
      type: String,
    },
    summary: String,
    duration: Number,
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
      required: true,
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
