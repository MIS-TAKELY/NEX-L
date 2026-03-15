import mongoose from "mongoose";

const quizSubmissionSchema = new mongoose.Schema(
  {
    quiz: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    answers: [{
        questionId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        answer: {
            type: String, // Storing student's selected option or short answer
            required: true
        },
        isCorrect: {
            type: Boolean, // Automatically evaluated
            default: false
        },
        pointsAwarded: {
            type: Number,
            default: 0
        }
    }],
    totalScore: {
        type: Number,
        default: 0
    },
    passed: {
        type: Boolean,
        default: false
    }
  },
  {
    timestamps: true,
  }
);

const QuizSubmission = mongoose.model("QuizSubmission", quizSubmissionSchema);
export default QuizSubmission;
