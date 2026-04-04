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
    <div className="space-y-6 bg-[#0F0F1A]/50 p-6 rounded-md border border-white/5 shadow-inner">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[10px] font-black text-[#A0A0B8] uppercase tracking-widest mb-2">
            Time Limit (Minutes)
          </label>
          <div className="relative">
            <Clock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A0A0B8]" />
            <input
              type="number"
              value={quizData.timeLimit || ""}
              onChange={(e) => updateQuiz("timeLimit", Number(e.target.value))}
              placeholder="0 for unlimited"
              className="w-full pl-11 pr-5 py-4 bg-[#1A1A2E] rounded-md border border-white/5 focus:ring-2 focus:ring-violet-500/30 focus:border-violet-500 outline-none transition-all duration-300 text-sm shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] text-white placeholder:text-[#6B6B80]"
            />
          </div>
        </div>

        <div className="flex items-center justify-between bg-[#1A1A2E] p-4 rounded-md border border-white/5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] mt-6">
          <label htmlFor={`autoGrade-${content.title}`} className="text-sm font-bold text-white cursor-pointer tracking-wide">
            Auto-grade submissions
          </label>
          <button
            type="button"
            role="switch"
            aria-checked={quizData.autoGrade}
            onClick={() => updateQuiz("autoGrade", !quizData.autoGrade)}
            className={`relative inline-flex h-6 w-11 items-center rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-violet-500 focus:ring-offset-2 focus:ring-offset-[#0F0F1A] ${
              quizData.autoGrade ? "bg-violet-500" : "bg-card/10"
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-md bg-card transition-transform ${
                quizData.autoGrade ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-xs font-black text-[#A0A0B8] uppercase tracking-wider flex items-center justify-between px-1">
          Questions
          <span className="bg-violet-500/10 text-violet-400 border border-violet-500/20 px-2.5 py-0.5 rounded-md text-[10px] tracking-widest">
            {quizData.questions?.length || 0}
          </span>
        </h4>

        {quizData.questions?.map((q, qIndex) => (
          <div key={qIndex} className="bg-[#1A1A2E] p-6 rounded-md border border-white/5 shadow-xl relative group">
            <button
              onClick={() => removeQuestion(qIndex)}
              className="absolute top-4 right-4 text-[#6B6B80] hover:text-pink-500 hover:bg-pink-500/10 p-2 rounded-md transition-all"
            >
              <Trash2 size={18} />
            </button>

            <div className="space-y-6 pr-8">
              <div>
                <label className="block text-[10px] font-black text-[#A0A0B8] uppercase tracking-widest mb-2">
                  Question Text
                </label>
                <input
                  type="text"
                  value={q.question}
                  onChange={(e) => updateQuestion(qIndex, "question", e.target.value)}
                  className="w-full px-4 py-3 text-base border-b-2 border-transparent hover:border-white/10 focus:border-violet-500 bg-black/20 outline-none transition-all font-bold text-white rounded-t-xl"
                  placeholder="e.g. What is the capital of France?"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-black text-[#A0A0B8] uppercase tracking-widest mb-2">
                    Question Type
                  </label>
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(qIndex, "type", e.target.value)}
                    className="w-full px-4 py-3 text-sm bg-black/20 text-white border border-white/5 rounded-md outline-none focus:ring-2 focus:ring-violet-500/30 appearance-none cursor-pointer"
                  >
                    <option value="mcq" className="bg-[#1A1A2E] text-white">Multiple Choice</option>
                    <option value="shortanswer" className="bg-[#1A1A2E] text-white">Short Answer</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-black text-[#A0A0B8] uppercase tracking-widest mb-2">
                    Points
                  </label>
                  <input
                    type="number"
                    value={q.points}
                    onChange={(e) => updateQuestion(qIndex, "points", Number(e.target.value))}
                    className="w-full px-4 py-3 text-sm bg-black/20 text-white border border-white/5 rounded-md outline-none focus:ring-2 focus:ring-violet-500/30 font-bold"
                  />
                </div>
              </div>

              {q.type === "mcq" ? (
                <div className="space-y-3 mt-6">
                  <label className="block text-[10px] font-black text-[#A0A0B8] uppercase tracking-widest mb-2">
                    Answers (Select correct one)
                  </label>
                  {q.options.map((opt, oIndex) => (
                    <div key={oIndex} className="flex items-center gap-3">
                       <button
                         onClick={() => updateQuestion(qIndex, "correctAnswer", opt)}
                         className={`flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all ${
                           q.correctAnswer === opt
                             ? "bg-emerald-500 border-emerald-500 text-[#0F0F1A] shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                             : "border-white/20 hover:border-emerald-500/50"
                         }`}
                       >
                         {q.correctAnswer === opt && <CheckCircle2 size={14} className="stroke-[3]" />}
                       </button>
                      <input
                        type="text"
                        value={opt}
                        onChange={(e) => updateOption(qIndex, oIndex, e.target.value)}
                        className={`flex-1 px-4 py-2.5 text-sm outline-none rounded-md transition-all ${
                           q.correctAnswer === opt ? "bg-emerald-500/10 text-emerald-400 font-bold border border-emerald-500/20" : "bg-black/20 text-white border border-white/5 focus:border-violet-500/50"
                        }`}
                      />
                      <button
                        onClick={() => removeOption(qIndex, oIndex)}
                        className="text-[#6B6B80] hover:text-pink-500 hover:bg-pink-500/10 p-2 rounded-md transition-colors"
                      >
                         <Trash2 size={16} />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(qIndex)}
                    className="text-xs font-bold text-violet-400 hover:text-violet-300 mt-4 flex items-center gap-2 px-2 py-1 rounded-md hover:bg-violet-500/10 transition-colors"
                  >
                    <Plus size={14} className="stroke-[3]" /> Add multiple choice option
                  </button>
                </div>
              ) : (
                <div className="mt-6">
                  <label className="block text-[10px] font-black text-[#A0A0B8] uppercase tracking-widest mb-2">
                    Acceptable Answer (Case Insensitive)
                  </label>
                  <input
                    type="text"
                    value={q.correctAnswer || ""}
                    onChange={(e) => updateQuestion(qIndex, "correctAnswer", e.target.value)}
                    placeholder="e.g. Paris"
                    className="w-full px-4 py-3 text-sm bg-black/20 text-emerald-400 placeholder:text-emerald-500/30 border border-emerald-500/20 focus:border-emerald-500 outline-none transition-all rounded-md font-bold"
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {(!quizData.questions || quizData.questions.length === 0) && (
          <div className="text-center py-10 bg-[#1A1A2E]/50 border-2 border-dashed border-white/10 rounded-md">
             <p className="text-sm font-bold text-[#6B6B80] mb-2 tracking-wide">No questions yet</p>
             <p className="text-[10px] text-[#6B6B80]">Click below to create your first question</p>
          </div>
        )}

        <button
          onClick={addQuestion}
          className="w-full py-4 border-2 border-dashed border-white/10 text-[#A0A0B8] hover:text-white rounded-md font-bold flex items-center justify-center gap-2 hover:bg-card/5 hover:border-violet-500/30 transition-all duration-300 text-sm tracking-wide"
        >
          <Plus size={16} /> Add Question
        </button>
      </div>
    </div>
  );
};

export default QuizBuilder;
