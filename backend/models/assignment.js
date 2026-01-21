// backend/models/Assignment.js
const mongoose = require("mongoose");

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  dueDate: Date,
  course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  submissions: [{
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    fileUrl: String,
    submittedAt: Date
  }]
}, { timestamps: true });

module.exports = mongoose.model("Assignment", assignmentSchema);
