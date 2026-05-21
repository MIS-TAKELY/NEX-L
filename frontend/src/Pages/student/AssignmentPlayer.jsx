import React, { useState, useRef } from 'react';
import { Icon } from '@iconify/react';
import { submitAssignment, uploadMedia } from '../../apis/course.api';
import { useSelector } from 'react-redux';
import { useToast } from '../../context/ToastContext';
import BadgeNotification from '../../components/student/BadgeNotification';

const AssignmentPlayer = ({ assignmentData, courseId, contentId }) => {
    const { userData } = useSelector((state) => state.auth);
    const { showToast } = useToast();
    const fileInputRef = useRef(null);
    
    // Safety check
    if (!assignmentData) {
        return (
            <div className="bg-card p-8 rounded-md text-center border border-destructive/20 premium-card">
                <Icon icon="solar:danger-triangle-bold" className="text-destructive mx-auto mb-4" size={48} />
                <h3 className="text-xl font-bold text-foreground">Assignment Data Unavailable</h3>
            </div>
        );
    }

    const [submissionText, setSubmissionText] = useState("");
    const [file, setFile] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [result, setResult] = useState(null);
    const [newBadges, setNewBadges] = useState([]);

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async () => {
        if (!submissionText.trim() && !file) {
            showToast("Please provide text or upload a file for your submission.", "error");
            return;
        }

        setIsSubmitting(true);
        try {
            let fileUrl = '';
            if (file) {
                const uploadRes = await uploadMedia(file);
                if (uploadRes?.url) {
                    fileUrl = uploadRes.url;
                }
            }

            const response = await submitAssignment(contentId, {
                text: submissionText,
                fileUrl,
            });
            
            if (response?.success) {
                // Use the submissionGrade returned by the backend directly
                setResult({
                    grade: response.submissionGrade,
                    maxScore: response.maxScore || assignmentData?.maxScore || 100,
                });
                // Show badge notification if any were earned
                const badges = response.data?.newBadges || response.newBadges || [];
                if (badges.length) {
                    setNewBadges(badges);
                }
                showToast(
                    response.submissionGrade !== null && response.submissionGrade !== undefined
                        ? `Assignment submitted and graded successfully! Score: ${response.submissionGrade}/${response.maxScore || assignmentData?.maxScore || 100}`
                        : "Assignment submitted successfully!",
                    "success"
                );
            }
        } catch (err) {
            console.error(err);
            showToast("Failed to submit assignment", "error");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (submitted && result) {
        return (
            <div className="bg-background p-10 rounded-md border border-border shadow-sm text-center max-w-2xl mx-auto mt-8">
                <div className="w-24 h-24 rounded-md mx-auto flex items-center justify-center mb-6 bg-emerald-500/10 text-emerald-500">
                    <Icon icon="solar:check-circle-bold" size={48} />
                </div>
                <h2 className="text-3xl font-extrabold text-foreground mb-2 italic serif">Assignment Submitted</h2>
                
                {result.grade !== undefined && (
                    <div className="my-8 p-6 bg-muted rounded-md border border-border">
                        <p className="text-muted-foreground font-bold uppercase tracking-widest text-xs mb-2">Automated Grade</p>
                        <div className="text-4xl font-black text-emerald-500">
                            {result.grade} <span className="text-xl text-muted-foreground/50">/ {result.maxScore || assignmentData.maxScore}</span>
                        </div>
                        <p className="mt-4 text-muted-foreground font-medium text-sm">
                            Your submission was automatically evaluated based on the instructor's criteria.
                        </p>
                    </div>
                )}

                <p className="text-muted-foreground font-medium mb-8">
                    {result.grade !== undefined 
                        ? "Your grade has been recorded. You can review your submission below."
                        : "Your work has been sent to the instructor for review. You will be notified once it's graded."}
                </p>
                <button 
                    onClick={() => { setSubmitted(false); setSubmissionText(""); setFile(null); setResult(null); }}
                    className="px-8 py-3 bg-secondary text-muted-foreground rounded-md font-bold hover:bg-gray-200 transition-all font-medium"
                >
                    Resubmit
                </button>
            </div>
        );
    }

    return (
        <>
        {newBadges.length > 0 && (
            <BadgeNotification badges={newBadges} onClose={() => setNewBadges([])} />
        )}
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-card p-8 md:p-10 rounded-md border border-border shadow-sm premium-card">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-md flex items-center justify-center flex-shrink-0">
                        <Icon icon="solar:file-check-bold" size={28} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-foreground italic">{assignmentData.title || "Assignment"}</h1>
                        <div className="flex items-center gap-4 mt-2">
                            <span className="text-sm font-bold text-muted-foreground flex items-center gap-1">
                                <Icon icon="solar:star-bold" className="text-yellow-500" />
                                {assignmentData.maxScore || 100} Points
                            </span>
                            {assignmentData.dueDate && (
                                <span className="text-sm font-bold text-muted-foreground flex items-center gap-1">
                                    <Icon icon="solar:calendar-bold" className="text-blue-500" />
                                    Due: {new Date(assignmentData.dueDate).toLocaleDateString()}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="prose prose-lg px-2 text-foreground font-medium">
                    <p>{assignmentData.description}</p>
                </div>
                
                {assignmentData.instructions && (
                    <div className="mt-8 bg-primary/5 p-6 rounded-md border border-primary/10">
                        <h4 className="font-bold text-primary flex items-center gap-2 mb-2">
                            <Icon icon="solar:info-circle-bold" className="text-primary" /> 
                            Instructor Instructions
                        </h4>
                        <p className="text-muted-foreground text-sm">{assignmentData.instructions}</p>
                    </div>
                )}
            </div>

            <div className="bg-card p-8 md:p-10 rounded-md border border-border shadow-sm relative overflow-hidden premium-card">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary via-accent to-primary-foreground"></div>
                <h3 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-3 serif italic">
                    Your Submission
                </h3>
                
                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wider">
                            Text Submission Response
                        </label>
                        <textarea
                            value={submissionText}
                            onChange={(e) => setSubmissionText(e.target.value)}
                            rows="6"
                            placeholder="Type your answer here or provide a link to your work..."
                            className="w-full p-5 rounded-md border-2 border-border bg-muted outline-none focus:bg-background focus:border-green-400 focus:ring-4 focus:ring-green-50 transition-all resize-none text-foreground font-medium"
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-foreground mb-2 uppercase tracking-wider">
                            Attach File (Optional)
                        </label>
                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className={`border-2 border-dashed rounded-md p-8 text-center cursor-pointer transition-all ${
                                file ? 'border-green-400 bg-green-50' : 'border-border bg-muted hover:bg-secondary hover:border-border'
                            }`}
                        >
                            <input 
                                type="file" 
                                className="hidden" 
                                ref={fileInputRef}
                                onChange={handleFileChange}
                            />
                            {file ? (
                                <div className="flex flex-col items-center">
                                    <Icon icon="solar:file-check-bold" className="text-green-500 mb-2" size={32} />
                                    <span className="font-bold text-green-700">{file.name}</span>
                                    <span className="text-xs text-green-600 font-medium mt-1">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                        className="mt-4 text-xs font-bold text-red-500 hover:text-red-700 uppercase tracking-widest bg-background px-3 py-1 rounded-md border border-red-100 shadow-sm"
                                    >
                                        Remove File
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <div className="w-14 h-14 bg-background rounded-md flex items-center justify-center shadow-sm border border-border mb-3">
                                        <Icon icon="solar:upload-bold" className="text-muted-foreground" size={24} />
                                    </div>
                                    <span className="font-bold text-foreground">Click to upload a file</span>
                                    <span className="text-xs text-muted-foreground font-medium mt-1">PDF, ZIP, DOCX, etc.</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-border flex justify-end">
                        <button
                            onClick={handleSubmit}
                            disabled={isSubmitting || (!submissionText.trim() && !file)}
                            className="px-10 py-4 bg-primary text-primary-foreground rounded-md font-bold hover:bg-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-xl shadow-primary/20 active:scale-95"
                        >
                            {isSubmitting ? (
                                <>
                                    <Icon icon="solar:spinner-bold" className="animate-spin" size={20} />
                                    Submitting...
                                </>
                            ) : (
                                <>
                                    <Icon icon="solar:plain-bold" size={20} />
                                    Turn in Assignment
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default AssignmentPlayer;
