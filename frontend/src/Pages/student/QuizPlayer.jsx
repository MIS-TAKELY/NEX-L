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
            <div className="bg-card p-8 rounded-md text-center border border-destructive/20 premium-card">
                <Icon icon="solar:danger-triangle-bold" className="text-destructive mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-foreground">Quiz Data Unavailable</h3>
                <p className="text-muted-foreground mt-2">The quiz data seems to be missing or incomplete.</p>
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
            <div className="bg-card p-10 rounded-md border border-border shadow-sm text-center max-w-2xl mx-auto premium-card">
                <div className={`w-24 h-24 rounded-md mx-auto flex items-center justify-center mb-6 ${result.passed ? 'bg-emerald-500/10 text-emerald-500' : 'bg-destructive/10 text-destructive'}`}>
                    <Icon icon={result.passed ? "solar:check-circle-bold" : "solar:close-circle-bold"} size={48} />
                </div>
                <h2 className="text-3xl font-extrabold text-foreground mb-2 italic serif">
                    {result.passed ? 'Congratulations!' : 'Keep Trying!'}
                </h2>
                <p className="text-muted-foreground font-medium mb-8">
                    You scored {result.percentage.toFixed(0)}% on this quiz. The passing score is {quizData.passingScore || 60}%.
                </p>
                
                <div className="flex justify-center gap-12 font-bold p-6 bg-muted rounded-md mb-8">
                    <div>
                        <p className="text-muted-foreground text-sm uppercase tracking-wider mb-1">Score</p>
                        <p className="text-2xl text-foreground">{result.score} / {result.totalQuestions}</p>
                    </div>
                </div>

                <div className="space-y-6 text-left mt-8">
                    <h3 className="font-bold text-lg border-b pb-2">Review Answers</h3>
                    {quizData.questions.map((q, idx) => (
                        <div key={idx} className="p-4 rounded-md border bg-muted">
                            <p className="font-bold text-foreground mb-3">{idx + 1}. {q.question}</p>
                            <div className="space-y-2">
                                {q.options.map((opt, optIdx) => {
                                    const isCorrect = q.correctAnswer === opt;
                                    const isSelected = answers[idx] === opt;
                                    
                                    let ringColor = "border-border";
                                    let bg = "bg-background";
                                    let textColor = "text-muted-foreground";
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
                                        <div key={optIdx} className={`px-4 py-3 rounded-md border flex items-center justify-between ${ringColor} ${bg}`}>
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
                        className="mt-8 px-8 py-3 bg-primary text-primary-foreground rounded-md font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
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
            <div className="bg-background p-8 rounded-md border border-border shadow-sm mb-8 premium-card">
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-orange-100 text-orange-600 rounded-md flex items-center justify-center">
                        <Icon icon="solar:check-read-bold" size={24} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-foreground italic">{quizData.title || "Quiz"}</h1>
                        <p className="text-muted-foreground font-medium">Test your knowledge on this topic.</p>
                    </div>
                </div>
                {quizData.description && (
                     <p className="text-muted-foreground mt-4 leading-relaxed font-medium bg-muted p-4 rounded-md">{quizData.description}</p>
                )}
                
                <div className="flex gap-6 mt-6 pt-6 border-t border-border">
                    <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                        <Icon icon="solar:document-text-bold" className="text-muted-foreground" size={18} />
                        {quizData.questions.length} Questions
                    </div>
                    {quizData.timeLimit > 0 && (
                        <div className="flex items-center gap-2 text-sm font-bold text-muted-foreground">
                            <Icon icon="solar:timer-bold" className="text-muted-foreground" size={18} />
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
                    <div key={idx} className="bg-background p-8 rounded-md border border-border shadow-sm">
                        <h3 className="text-xl font-bold text-foreground mb-6 flex gap-4">
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
                                        className={`w-full text-left px-6 py-4 rounded-md border-2 transition-all flex items-center gap-4 ${
                                            isSelected 
                                                ? 'border-orange-500 bg-orange-50 text-orange-900' 
                                                : 'border-border bg-background hover:border-orange-200 hover:bg-orange-50/30 text-foreground'
                                        }`}
                                    >
                                        <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 ${
                                            isSelected ? 'border-orange-500' : 'border-border'
                                        }`}>
                                            {isSelected && <div className="w-3 h-3 rounded-md bg-orange-500" />}
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
                    className="px-10 py-4 bg-orange-600 text-foreground rounded-md font-bold hover:bg-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-orange-200 active:scale-95 flex items-center gap-2"
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
