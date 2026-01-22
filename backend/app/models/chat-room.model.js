import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  content: String,
  timestamp: { type: Date, default: Date.now },
});

const chatRoomSchema = new mongoose.Schema(
  {
    name: String,
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    messages: [messageSchema],
    type: { type: String, enum: ["group", "oneonone"] },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("ChatRoom", chatRoomSchema);
