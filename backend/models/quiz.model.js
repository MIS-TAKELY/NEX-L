import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: String,
  type: { type: String, enum: ["mcq", "shortanswer"] },
  options: [String],
  correctAnswer: String,
  points: Number,
});

const quizSchema = new mongoose.Schema(
  {
    title: String,
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    section: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Section",
    },
    questions: [questionSchema],
    timeLimit: Number, 
    autoGrade: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Quiz", quizSchema);
