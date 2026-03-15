import React from 'react';
import { Clock, Plus, Trash2, CheckCircle2 } from 'lucide-react';

const QuizBuilder = ({ content, onChange }) => {
  const quizData = content.quizData || { questions: [], timeLimit: 0, autoGrade: true };

  const updateQuiz = (field, value) => {
    onChange({
      ...content,
      quizData: {
        ...quizData,
        [field]: value
      }
    });
  };

  const addQuestion = () => {
    const newQuestions = [...(quizData.questions || [])];
    newQuestions.push({
      question: "New Question",
      type: "mcq",
      options: ["Option 1", "Option 2"],
      correctAnswer: "Option 1",
      points: 1
    });
    updateQuiz("questions", newQuestions);
  };

  const updateQuestion = (qIndex, field, value) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex][field] = value;
    updateQuiz("questions", newQuestions);
  };

  const removeQuestion = (qIndex) => {
    const newQuestions = [...quizData.questions].filter((_, i) => i !== qIndex);
    updateQuiz("questions", newQuestions);
  };

  const addOption = (qIndex) => {
    const newQuestions = [...quizData.questions];
    newQuestions[qIndex].options.push(`Option ${newQuestions[qIndex].options.length + 1}`);
    updateQuiz("questions", newQuestions);
  };

  const removeOption = (qIndex, oIndex) => {
    const newQuestions = [...quizData.questions];
    const prevAnswer = newQuestions[qIndex].correctAnswer;
    const removedOption = newQuestions[qIndex].options[oIndex];

    newQuestions[qIndex].options = newQuestions[qIndex].options.filter((_, i) => i !== oIndex);
    
    // Reset correct answer if it was deleted
    if (prevAnswer === removedOption && newQuestions[qIndex].options.length > 0) {
      newQuestions[qIndex].correctAnswer = newQuestions[qIndex].options[0];
    } else if (newQuestions[qIndex].options.length === 0) {
      newQuestions[qIndex].correctAnswer = "";
    }
    
    updateQuiz("questions", newQuestions);
  };

  const updateOption = (qIndex, oIndex, newValue) => {
    const newQuestions = [...quizData.questions];
    const oldValue = newQuestions[qIndex].options[oIndex];
    newQuestions[qIndex].options[oIndex] = newValue;

    // Update correctAnswer if this option was marked as correct
    if (newQuestions[qIndex].correctAnswer === oldValue) {
      newQuestions[qIndex].correctAnswer = newValue;
    }

    updateQuiz("questions", newQuestions);
  };

  return (
    <div className="space-y-6 bg-gray-50/30 p-5 rounded-2xl border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">
            Time Limit (Minutes)
          </label>
          <div className="relative">
            <Clock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="number"
              value={quizData.timeLimit || 0}
              onChange={(e) => updateQuiz("timeLimit", Number(e.target.value))}
              placeholder="0 for unlimited"
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-100 focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm shadow-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id={`autoGrade-${content.title}`}
            checked={quizData.autoGrade}
            onChange={(e) => updateQuiz("autoGrade", e.target.checked)}
            className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
          />
          <label htmlFor={`autoGrade-${content.title}`} className="text-sm font-bold text-gray-700">
            Auto-grade submissions
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-black text-gray-800 uppercase tracking-wide flex items-center justify-between">
          Questions
          <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full text-[10px]">
            {quizData.questions?.length || 0}
          </span>
        </h4>

        {quizData.questions?.map((q, qIndex) => (
          <div key={qIndex} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm relative group">
            <button
              onClick={() => removeQuestion(qIndex)}
              className="absolute top-2 right-2 text-gray-300 hover:text-red-500 hover:bg-red-50 p-1.5 rounded-lg transition-all"
            >
              <Trash2 size={16} />
            </button>

            <div className="space-y-4 pr-6">
              <div>
                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                  Question Text
                </label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                  className="w-full px-3 py-2 text-sm border-b-2 border-transparent hover:border-gray-200 focus:border-blue-500 bg-transparent outline-none transition-all font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Question Type
                  </label>
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(qIndex, "type", e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="mcq">Multiple Choice</option>
                    <option value="shortanswer">Short Answer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    value={q.points}
                    onChange={(e) => updateQuestion(qIndex, "points", Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-gray-50 border border-gray-100 rounded-lg outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {q.type === "mcq" ? (
                <div className="space-y-2 mt-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Answers (Select correct one)
                  </label>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-2">
                       <button
                         onClick={() => updateQuestion(qIndex, "correctAnswer", opt)}
                         className={`w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                           q.correctAnswer === opt
                             ? "bg-green-500 border-green-500 text-white shadow-md shadow-green-200"
                             : "border-gray-300 hover:border-green-400"
                         }`}
                       >
                         {q.correctAnswer === opt && <CheckCircle2 size={12} />}
                       </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        className={`flex-1 px-3 py-1.5 text-sm outline-none rounded-md transition-all ${
                           q.correctAnswer === opt ? "bg-green-50/50 font-semibold" : "bg-gray-50 focus:bg-white border border-transparent focus:border-gray-200"
                        }`}
                      />
                      <button
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 p-1 rounded transition-colors"
                      >
                         <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(qIndex)}
                    className="text-xs font-bold text-blue-500 hover:text-blue-700 mt-2 flex items-center gap-1"
                  >
                    <Plus size={12} /> Add option
                  </button>
                </div>
              ) : (
                <div className="mt-4">
                  <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">
                    Acceptable Answer (Case Insensitive)
                  </label>
                  <input
                    type="text"
                    value={q.correctAnswer || ""}
                    onChange={(e) => updateQuestion(qIndex, "correctAnswer", e.target.value)}
                    placeholder="e.g. Paris"
                    className="w-full px-3 py-2 text-sm border-b-2 border-transparent bg-gray-50 hover:bg-white focus:border-blue-500 outline-none transition-all rounded-t-md"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {(!quizData.questions || quizData.questions.length === 0) && (
          <div className="text-center py-6 bg-white border border-dashed border-gray-200 rounded-xl">
             <p className="text-sm font-medium text-gray-400 mb-2">No questions yet</p>
          </div>
        )}

        <button
          onClick={addQuestion}
          className="w-full py-3 border border-dashed border-blue-200 text-blue-600 bg-blue-50/50 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-50 transition-all text-sm"
        >
          <Plus size={16} /> Add Question
        </button>
      </div>
    </div>
  );
};

export default QuizBuilder;
