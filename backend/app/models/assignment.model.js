import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    dueDate: { type: Date },
    course: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
    autoGrade: { type: Boolean, default: false },
    gradingCriteria: { type: String, default: "" },
    maxScore: { type: Number, default: 100 },
    submissions: [
      {
        student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        fileUrl: { type: String },
        text: { type: String },
        grade: { type: Number, default: null },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

const Assignment = mongoose.model("Assignment", assignmentSchema);
export default Assignment;
