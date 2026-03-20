import React from 'react';
import { Loader2, CheckCircle2, Clock } from 'lucide-react';

const UploadStatusOverlay = ({ isOpen, totalFiles, uploadedFiles }) => {
    if (!isOpen) return null;

    const progress = totalFiles > 0 ? (uploadedFiles / totalFiles) * 100 : 0;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm transition-all duration-300">
            <div className="bg-background rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 border border-gray-100 transform scale-100 animate-in fade-in zoom-in duration-300">
                <div className="flex flex-col items-center text-center">
                    <div className="relative mb-6">
                        <div className="w-20 h-20 rounded-full border-4 border-gray-100 flex items-center justify-center">
                            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-background rounded-full p-1 shadow-sm">
                            <Clock className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-2">Publishing Course</h3>
                    <p className="text-gray-500 mb-6">
                        Please wait while we finalize your course content. Files are still being uploaded.
                    </p>

                    <div className="w-full bg-gray-100 rounded-full h-3 mb-2 overflow-hidden">
                        <div
                            className="bg-blue-600 h-full transition-all duration-500 ease-out"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>

                    <div className="flex justify-between w-full text-sm font-medium">
                        <span className="text-blue-600">{Math.round(progress)}% Complete</span>
                        <span className="text-gray-400">{uploadedFiles} of {totalFiles} files</span>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-sm text-gray-400 italic">
                        <CheckCircle2 size={16} className="text-green-500" />
                        Don't close this window during the process
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadStatusOverlay;
