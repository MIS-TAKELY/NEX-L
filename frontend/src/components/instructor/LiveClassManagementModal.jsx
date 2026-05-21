import React, { useState } from 'react';
import { Icon } from '@iconify/react';
import { 
    useGetCourseLiveClassesQuery, 
    useDeleteLiveClassMutation 
} from '@/store/slices/liveClassApi';
import { useToast } from '@/context/ToastContext';
import dayjs from 'dayjs';
import ScheduleClassModal from './ScheduleClassModal';
import ConfirmModal from '../common/ConfirmModal';

const LiveClassManagementModal = ({ isOpen, onClose, courseId, courseTitle }) => {
    const { data: liveClasses = [], isLoading, isError } = useGetCourseLiveClassesQuery(courseId, {
        skip: !isOpen || !courseId
    });
    const [deleteLiveClass] = useDeleteLiveClassMutation();
    const { showToast } = useToast();

    const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
    const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState(null);

    if (!isOpen) return null;

    const handleEdit = (liveClass) => {
        setSelectedClass(liveClass);
        setIsScheduleModalOpen(true);
    };

    const handleDeleteClick = (liveClass) => {
        setSelectedClass(liveClass);
        setIsConfirmDeleteOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!selectedClass) return;
        try {
            await deleteLiveClass({ classId: selectedClass._id, courseId }).unwrap();
            showToast("Schedule cancelled successfully", "success");
            setIsConfirmDeleteOpen(false);
            setSelectedClass(null);
        } catch (error) {
            console.error("Failed to cancel schedule:", error);
            showToast(error.data?.message || "Failed to cancel schedule", "error");
        }
    };

    const handleAddNew = () => {
        setSelectedClass(null);
        setIsScheduleModalOpen(true);
    };

    return (
        <>
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
                <div className="bg-background w-full max-w-3xl rounded-md shadow-2xl border border-border/50 overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border/50 shrink-0">
                        <div>
                            <h2 className="text-2xl font-black text-foreground tracking-tight">Live Session Management</h2>
                            <p className="text-sm text-muted-foreground">{courseTitle}</p>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-2 hover:bg-secondary rounded-md transition-colors group"
                        >
                            <Icon icon="solar:close-circle-bold" className="w-8 h-8 text-muted-foreground group-hover:text-foreground transition-colors" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-lg text-foreground">Scheduled Sessions</h3>
                            <button
                                onClick={handleAddNew}
                                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-all font-bold text-sm flex items-center gap-2 shadow-lg shadow-primary/20"
                            >
                                <Icon icon="solar:calendar-add-bold" className="w-5 h-5" />
                                Schedule New
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="py-20 text-center text-muted-foreground animate-pulse">
                                Loading schedules...
                            </div>
                        ) : isError ? (
                            <div className="py-20 text-center text-red-500 font-medium font-outfit">
                                Failed to load schedules. Please try again.
                            </div>
                        ) : liveClasses.length === 0 ? (
                            <div className="py-20 text-center bg-secondary/20 rounded-md border border-dashed border-border/50">
                                <Icon icon="solar:calendar-linear" className="w-16 h-16 mx-auto mb-4 text-muted-foreground/30" />
                                <p className="text-muted-foreground font-medium">No live sessions scheduled for this course.</p>
                                <button 
                                    onClick={handleAddNew}
                                    className="mt-4 text-primary font-bold hover:underline"
                                >
                                    Schedule your first class now
                                </button>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {liveClasses.map((liveClass) => (
                                    <div 
                                        key={liveClass._id}
                                        className="p-5 rounded-md bg-card border border-border/50 hover:border-primary/30 transition-all group flex flex-col md:flex-row md:items-center justify-between gap-4"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div className="hidden md:flex flex-col items-center justify-center w-14 h-14 rounded-md bg-background border border-border/50 shrink-0">
                                                <span className="text-[10px] font-bold text-primary uppercase leading-none mb-1">{dayjs(liveClass.startTime).format('MMM')}</span>
                                                <span className="text-xl font-black text-foreground leading-none">{dayjs(liveClass.startTime).format('D')}</span>
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">{liveClass.title}</h4>
                                                <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-muted-foreground font-medium">
                                                    <span className="flex items-center gap-1.5">
                                                        <Icon icon="solar:clock-circle-bold" className="text-primary/70" />
                                                        {dayjs(liveClass.startTime).format('h:mm A')}
                                                    </span>
                                                    <span className="flex items-center gap-1.5">
                                                        <Icon icon="solar:stopwatch-bold" className="text-primary/70" />
                                                        {liveClass.duration} min
                                                    </span>
                                                    <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                                                        liveClass.status === 'live' ? 'bg-red-500/10 text-red-500 border border-red-500/20' :
                                                        liveClass.status === 'completed' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' :
                                                        'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                                    }`}>
                                                        {liveClass.status}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 shrink-0 md:opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => handleEdit(liveClass)}
                                                className="p-2.5 rounded-md bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                                                title="Edit Schedule"
                                            >
                                                <Icon icon="solar:pen-new-square-bold-duotone" className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleDeleteClick(liveClass)}
                                                className="p-2.5 rounded-md bg-secondary text-secondary-foreground hover:bg-destructive/10 hover:text-destructive transition-all border border-transparent hover:border-destructive/20"
                                                title="Cancel Schedule"
                                            >
                                                <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Sub Modals */}
            <ScheduleClassModal 
                isOpen={isScheduleModalOpen}
                onClose={() => setIsScheduleModalOpen(false)}
                courseId={courseId}
                courseTitle={courseTitle}
                editClass={selectedClass}
            />

            <ConfirmModal 
                isOpen={isConfirmDeleteOpen}
                onClose={() => setIsConfirmDeleteOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Cancel Live Session?"
                message="Are you sure you want to cancel this scheduled live session? Students will no longer see it in their schedule."
                confirmText="Cancel Session"
                type="danger"
            />
        </>
    );
};

export default LiveClassManagementModal;
