import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { submitQuizAttempt } from '../../apis/course.api';
import { useSelector } from 'react-redux';
import { useToast } from '../../context/ToastContext';
import BadgeNotification from '../../components/student/BadgeNotification';

const QuizPlayer = ({ quizData, courseId, contentId }) => {
    const { userData } = useSelector((state) => state.auth);
    const { showToast } = useToast();
    
    // Safety check - if quizData is missing or malformed
    if (!quizData || !quizData.questions) {
        return (
            <div className="bg-background p-8 rounded-3xl text-center border border-red-100">
                <Icon icon="solar:danger-triangle-bold" className="text-red-500 mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-gray-800">Quiz Data Unavailable</h3>
                <p className="text-gray-500 mt-2">The quiz data seems to be missing or incomplete.</p>
            </div>
        );
    }

    const [answers, setAnswers] = useState({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [newBadges, setNewBadges] = useState([]);

    const handleOptionSelect = (qIndex, optionIndex) => {
        if (submitted) return;
        const selectedValue = quizData.questions[qIndex].options[optionIndex];
        setAnswers(prev => ({
            ...prev,
            [qIndex]: selectedValue
        }));
    };

    const handleSubmit = async () => {
        // Validate all questions answered
        if (Object.keys(answers).length < quizData.questions.length) {
            showToast("Please answer all questions before submitting.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            // Formatting answers for backend
            const studentAnswers = quizData.questions.map((q, idx) => ({
                questionId: q._id || idx,
                answer: answers[idx]
            }));

            // We need a quiz ID. Assuming contentId acts as the reference for now.
            const response = await submitQuizAttempt(contentId, {
                answers: studentAnswers,
                timeSpent: 0 // Could implement a timer in the future
            });

            if (response.success) {
                setSubmitted(true);
                setResult(response.data);
                // Show badge notification if any were earned
                if (response.data?.newBadges?.length) {
                    setNewBadges(response.data.newBadges);
                }
                showToast("Quiz submitted successfully!", "success");
            }
        } catch (err) {
            console.error(err);
            // Fallback basic client-side grading if backend is completely unavailable for grading
            console.warn("Backend grading failed, falling back to local grading for demo purposes");
            
            let score = 0;
            quizData.questions.forEach((q, idx) => {
                if (answers[idx]?.trim().toLowerCase() === q.correctAnswer?.trim().toLowerCase()) {
                    score++;
                }
            });
            const percent = (score / quizData.questions.length) * 100;
            
            setSubmitted(true);
            setResult({
                score,
                totalQuestions: quizData.questions.length,
                percentage: percent,
                passed: percent >= (quizData.passingScore || 60)
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted && result) {
        return (
            <div className="bg-background p-10 rounded-3xl border border-gray-100 shadow-sm text-center max-w-2xl mx-auto">
                <div className={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-6 ${result.passed ? 'bg-green-100 text-green-500' : 'bg-red-100 text-red-500'}`}>
                    <Icon icon={result.passed ? "solar:check-circle-bold" : "solar:close-circle-bold"} size={48} />
                </div>
                <h2 className="text-3xl font-extrabold text-gray-900 mb-2 italic">
                    {result.passed ? 'Congratulations!' : 'Keep Trying!'}
                </h2>
                <p className="text-gray-500 font-medium mb-8">
                    You scored {result.percentage.toFixed(0)}% on this quiz. The passing score is {quizData.passingScore || 60}%.
                </p>
                
                <div className="flex justify-center gap-12 font-bold p-6 bg-gray-50 rounded-2xl mb-8">
                    <div>
                        <p className="text-gray-400 text-sm uppercase tracking-wider mb-1">Score</p>
                        <p className="text-2xl text-gray-900">{result.score} / {result.totalQuestions}</p>
                    </div>
                </div>

                <div className="space-y-6 text-left mt-8">
                    <h3 className="font-bold text-lg border-b pb-2">Review Answers</h3>
                    {quizData.questions.map((q, idx) => (
                        <div key={idx} className="p-4 rounded-xl border bg-gray-50">
                            <p className="font-bold text-gray-800 mb-3">{idx + 1}. {q.question}</p>
                            <div className="space-y-2">
                                {q.options.map((opt, optIdx) => {
                                    const isCorrect = q.correctAnswer === opt;
                                    const isSelected = answers[idx] === opt;
                                    
                                    let ringColor = "border-gray-200";
                                    let bg = "bg-background";
                                    let textColor = "text-gray-600";
                                    let icon = null;

                                    if (isCorrect) {
                                        ringColor = "border-green-500";
                                        bg = "bg-green-50";
                                        textColor = "text-green-700 font-bold";
                                        icon = <Icon icon="solar:check-circle-bold" className="text-green-500" />;
                                    } else if (isSelected && !isCorrect) {
                                        ringColor = "border-red-500";
                                        bg = "bg-red-50";
                                        textColor = "text-red-700 font-bold";
                                        icon = <Icon icon="solar:close-circle-bold" className="text-red-500" />;
                                    }

                                    return (
                                        <div key={optIdx} className={`px-4 py-3 rounded-xl border flex items-center justify-between ${ringColor} ${bg}`}>
                                            <span className={textColor}>{opt}</span>
                                            {icon}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
                
                {/* Normally we wouldn't show a 'Retake' without clearing backend submission state first, 
                    but adding for UX demo purposes */}
                {!result.passed && (
                     <button 
                        onClick={() => { setSubmitted(false); setAnswers({}); setResult(null); }}
                        className="mt-8 px-8 py-3 bg-gray-900 text-foreground rounded-xl font-bold hover:bg-gray-800 transition-all"
                     >
                        Retake Quiz
                     </button>
                )}
            </div>
        );
    }

    return (
        <>
        {newBadges.length > 0 && (
            <BadgeNotification badges={newBadges} onClose={() => setNewBadges([])} />
        )}
        <div className="max-w-3xl mx-auto">
            <div className="bg-background p-8 rounded-3xl border border-gray-100 shadow-sm mb-8 premium-card">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-2xl flex items-center justify-center">
                        <Icon icon="solar:check-read-bold" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 italic">{quizData.title || "Quiz"}</h1>
                        <p className="text-gray-500 font-medium">Test your knowledge on this topic.</p>
                    </div>
                </div>
                {quizData.description && (
                     <p className="text-gray-600 mt-4 leading-relaxed font-medium bg-gray-50 p-4 rounded-2xl">{quizData.description}</p>
                )}
                
                <div className="flex gap-6 mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                        <Icon icon="solar:document-text-bold" className="text-gray-400" size={18} />
                        {quizData.questions.length} Questions
                    </div>
                    {quizData.timeLimit > 0 && (
                        <div className="flex items-center gap-2 text-sm font-bold text-gray-500">
                            <Icon icon="solar:timer-bold" className="text-gray-400" size={18} />
                            {quizData.timeLimit} Mins
                        </div>
                    )}
                    <div className="flex items-center gap-2 text-sm font-bold text-orange-500">
                        <Icon icon="solar:target-bold" size={18} />
                        {quizData.passingScore || 60}% to pass
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                {quizData.questions.map((q, idx) => (
                    <div key={idx} className="bg-background p-8 rounded-3xl border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold text-gray-900 mb-6 flex gap-4">
                            <span className="text-orange-500">{idx + 1}.</span>
                            <span>{q.question}</span>
                        </h3>
                        <div className="space-y-3">
                            {q.options.map((opt, optIdx) => {
                                const isSelected = answers[idx] === opt;
                                return (
                                    <button
                                        key={optIdx}
                                        onClick={() => handleOptionSelect(idx, optIdx)}
                                        className={`w-full text-left px-6 py-4 rounded-2xl border-2 transition-all flex items-center gap-4 ${
                                            isSelected 
                                                ? 'border-orange-500 bg-orange-50 text-orange-900' 
                                                : 'border-gray-100 bg-background hover:border-orange-200 hover:bg-orange-50/30 text-gray-700'
                                        }`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                                            isSelected ? 'border-orange-500' : 'border-gray-300'
                                        }`}>
                                            {isSelected && <div className="w-3 h-3 rounded-full bg-orange-500" />}
                                        </div>
                                        <span className="font-medium text-lg">{opt}</span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-8 flex justify-end">
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting || Object.keys(answers).length < quizData.questions.length}
                    className="px-10 py-4 bg-orange-600 text-foreground rounded-2xl font-bold hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-orange-200 active:scale-95 flex items-center gap-2"
                >
                    {isSubmitting ? (
                        <>
                            <Icon icon="solar:spinner-bold" className="animate-spin" />
                            Submitting...
                        </>
                    ) : (
                        "Submit Quiz"
                    )}
                </button>
            </div>
        </div>
        </>
    );
};

export default QuizPlayer;
