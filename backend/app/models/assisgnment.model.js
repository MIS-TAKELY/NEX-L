import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({
  title: String,
  description: String,
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true,
  },
  section: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Section',
  },
  dueDate: Date,
  maxPoints: Number,
}, {
  timestamps: true,
});

module.exports = mongoose.model('Assignment', assignmentSchema);