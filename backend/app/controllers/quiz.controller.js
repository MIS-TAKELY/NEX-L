import Quiz from "../models/quiz.model.js";
import QuizSubmission from "../models/submission.model.js";
import Course from "../models/course.model.js";

// Create a new quiz
export const createQuiz = async (req, res) => {
  try {
    const { title, courseId, sectionId, questions, timeLimit, autoGrade } = req.body;

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    const quiz = new Quiz({
      title,
      course: courseId,
      section: sectionId,
      questions,
      timeLimit,
      autoGrade
    });

    await quiz.save();
    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    console.error("Error creating quiz:", error);
    res.status(500).json({ success: false, message: "Failed to create quiz", error: error.message });
  }
};

// Get quiz by Id
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }
    res.status(200).json({ success: true, data: quiz });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    res.status(500).json({ success: false, message: "Failed to fetch quiz", error: error.message });
  }
};

// Submit quiz and auto-evaluate
export const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // Array of { questionId, answer }
    const quizId = req.params.id;
    const studentId = req.user.id; // From auth middleware

    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ success: false, message: "Quiz not found" });
    }

    let totalScore = 0;
    const evaluatedAnswers = answers.map(studentAns => {
        const question = quiz.questions.id(studentAns.questionId);
        let isCorrect = false;
        let pointsAwarded = 0;

        if (question) {
            // Case insensitive exact match for short answer and MCQ
            if (question.correctAnswer && studentAns.answer.trim().toLowerCase() === question.correctAnswer.trim().toLowerCase()) {
                isCorrect = true;
                pointsAwarded = question.points || 1;
            }
        }
        
        totalScore += pointsAwarded;

        return {
            questionId: studentAns.questionId,
            answer: studentAns.answer,
            isCorrect,
            pointsAwarded
        };
    });

    const passThreshold = 0.5; // E.g., 50% to pass
    const totalPossiblePoints = quiz.questions.reduce((acc, q) => acc + (q.points || 1), 0);
    const passed = (totalScore / totalPossiblePoints) >= passThreshold;

    const submission = new QuizSubmission({
        quiz: quizId,
        student: studentId,
        answers: evaluatedAnswers,
        totalScore,
        passed
    });

    await submission.save();

    res.status(201).json({ 
        success: true, 
        message: "Quiz submitted successfully", 
        data: {
            score: totalScore,
            totalQuestions: quiz.questions.length,
            percentage: (totalScore / totalPossiblePoints) * 100,
            passed,
            evaluatedAnswers: quiz.autoGrade ? evaluatedAnswers : []
        } 
    });

  } catch (error) {
    console.error("Error submitting quiz:", error);
    res.status(500).json({ success: false, message: "Failed to submit quiz", error: error.message });
  }
};

// Get quiz submissions for a course / instructor
export const getQuizSubmissions = async (req, res) => {
    try {
        const { quizId } = req.params;
        const submissions = await QuizSubmission.find({ quiz: quizId }).populate('student', 'name email');
        
        res.status(200).json({ success: true, data: submissions });
    } catch (error) {
        console.error("Error fetching submissions:", error);
        res.status(500).json({ success: false, message: "Failed to fetch submissions", error: error.message });
    }
};

