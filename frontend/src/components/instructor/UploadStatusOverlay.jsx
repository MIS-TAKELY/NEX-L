import React from 'react';
import { Loader2, CheckCircle2, Clock } from 'lucide-react';

const UploadStatusOverlay = ({ isOpen, totalFiles, uploadedFiles }) => {
    if (!isOpen) return null;

    const progress = totalFiles > 0 ? (uploadedFiles / totalFiles) * 100 : 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-background rounded-md shadow-2xl p-8 max-w-md w-full mx-4 border border-border transform scale-100 animate-in fade-in zoom-in duration-300">
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-md border-4 border-border flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-primary/90 animate-spin" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-md p-1 shadow-sm">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-foreground mb-2">Publishing Course</h3>
                    <p className="text-muted-foreground mb-6">
                        Please wait while we finalize your course content. Files are still being uploaded.
                    </p>

                    <div className="w-full bg-muted rounded-md h-3 mb-2 overflow-hidden">
                        <div
                            className="bg-primary h-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between w-full text-sm font-medium">
                        <span className="text-primary/90">{Math.round(progress)}% Complete</span>
                        <span className="text-muted-foreground/80">{uploadedFiles} of {totalFiles} files</span>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-sm text-muted-foreground/80 italic">
                        <CheckCircle2 size={16} className="text-green-500" />
                        Don't close this window during the process
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadStatusOverlay;
