import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { useScheduleLiveClassMutation } from '@/store/slices/liveClassApi';
import { useToast } from '@/context/ToastContext';

const ScheduleClassModal = ({ isOpen, onClose, courseId, courseTitle }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [startTime, setStartTime] = useState('');
    const [duration, setDuration] = useState(60);
    const { showToast } = useToast();
    
    const [scheduleLiveClass, { isLoading }] = useScheduleLiveClassMutation();

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await scheduleLiveClass({
                courseId,
                title,
                description,
                startTime,
                duration: Number(duration)
            }).unwrap();
            showToast("Class scheduled successfully!", "success");
            onClose();
            // Reset form
            setTitle('');
            setDescription('');
            setStartTime('');
            setDuration(60);
        } catch (error) {
            console.error("Failed to schedule class:", error);
            showToast(error.data?.message || "Failed to schedule class", "error");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-background w-full max-w-lg rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 line-clamp-1">Schedule Live Class</h2>
                        <p className="text-sm text-gray-500">{courseTitle}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <Icon icon="solar:close-circle-bold" className="w-6 h-6 text-gray-400" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Class Title</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Introduction to React"
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What will be covered in this session?"
                            rows={3}
                            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
                            <input
                                type="datetime-local"
                                required
                                value={startTime}
                                onChange={(e) => setStartTime(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (min)</label>
                            <input
                                type="number"
                                required
                                min="15"
                                step="15"
                                value={duration}
                                onChange={(e) => setDuration(e.target.value)}
                                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="flex-1 px-4 py-2 bg-blue-600 text-foreground font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <div className="w-5 h-5 border-2 border-foreground border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <Icon icon="solar:calendar-add-bold" className="w-5 h-5" />
                            )}
                            Schedule Class
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleClassModal;
