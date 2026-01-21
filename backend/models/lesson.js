// backend/models/Lesson.js
const mongoose = require("mongoose");

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  contentUrl: String,       // video URL / PDF / notes
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true }
}, { timestamps: true });

module.exports = mongoose.model("Lesson", lessonSchema);
