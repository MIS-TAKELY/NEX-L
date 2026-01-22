import mongoose from "mongoose";

const postSchema = new mongoose.Schema({
  author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  replies: [
    {
      author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      content: String,
      timestamp: Date,
    },
  ],
  timestamp: { type: Date, default: Date.now },
});

const forumSchema = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    posts: [postSchema],
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Forum", forumSchema);
