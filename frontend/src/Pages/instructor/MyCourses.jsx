import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetInstructorCoursesQuery, useDeleteCourseMutation } from '@/store/slices/courseApi';
import ConfirmModal from '@/components/common/ConfirmModal';
import LiveClassManagementModal from '@/components/instructor/LiveClassManagementModal';
import { useToast } from '@/context/ToastContext';
import { 
    useGetInstructorActiveClassesQuery, 
    useEndAllCourseLiveClassesMutation 
} from '@/store/slices/liveClassApi';

import { Skeleton } from '@/components/ui/skeleton';
import CourseSkeleton from '@/components/skeletons/CourseSkeleton';

const MyCourses = () => {
    const navigate = useNavigate();
    const { userData } = useSelector((state) => state.auth);
    const { showToast } = useToast();

    const {
        data: courses = [],
        isLoading,
        isError,
        refetch
    } = useGetInstructorCoursesQuery(userData?.id, {
        skip: !userData?.id
    });

    const [deleteCourse] = useDeleteCourseMutation();
    const { data: activeClasses = [] } = useGetInstructorActiveClassesQuery(undefined, {
        pollingInterval: 10000 // Poll every 10s to stay in sync
    });
    const [endAllLiveClasses] = useEndAllCourseLiveClassesMutation();

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [isManagementOpen, setIsManagementOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const handleManageScheduleClick = (course) => {
        setSelectedCourse(course);
        setIsManagementOpen(true);
    };

    const handleDeleteClick = (id) => {
        setCourseToDelete(id);
        setIsConfirmOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (!courseToDelete) return;
        try {
            await deleteCourse(courseToDelete).unwrap();
            showToast("Course deleted successfully!", "success");
        } catch (error) {
            console.error("Failed to delete course", error);
            showToast("Failed to delete course. " + (error.data?.message || error.message || ""), "error");
        } finally {
            setCourseToDelete(null);
            setIsConfirmOpen(false);
        }
    };

    const handleEndSession = async (courseId) => {
        try {
            await endAllLiveClasses(courseId).unwrap();
            showToast("Live session ended successfully", "success");
        } catch (error) {
            console.error("Failed to end session", error);
            showToast("Failed to end session", "error");
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-6 animate-fade-in">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 backdrop-blur-md p-7 rounded-md border border-border/50 shadow-soft premium-card">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-48" />
                        <Skeleton className="h-4 w-64" />
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <CourseSkeleton key={i} />
                    ))}
                </div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-8 text-center bg-card rounded-md border border-border/50 max-w-md mx-auto mt-10 premium-card">
                <div className="w-16 h-16 bg-destructive/10 rounded-md flex items-center justify-center mx-auto mb-4">
                    <Icon icon="solar:danger-bold-duotone" className="w-8 h-8 text-destructive" />
                </div>
                <p className="text-destructive font-bold mb-4">Failed to load courses</p>
                <button
                    onClick={refetch}
                    className="px-6 py-2.5 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-all font-bold shadow-lg shadow-primary/20"
                >
                    Retry Connection
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in group/container">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 backdrop-blur-md p-7 rounded-md border border-border/50 shadow-soft premium-card">
                <div>
                    <h1 className="text-2xl font-black text-foreground tracking-tight">My Courses</h1>
                    <p className="text-sm text-muted-foreground mt-1 font-medium italic">Manage and monitor your educational content</p>
                </div>
                <button
                    onClick={() => navigate('/instructor/add-course')}
                    className="w-full md:w-auto px-7 py-3 bg-primary text-primary-foreground rounded-md hover:scale-105 active:scale-95 transition-all shadow-xl shadow-primary/25 font-black flex items-center justify-center gap-2.5 uppercase tracking-wider text-sm"
                >
                    <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                    Create New Course
                </button>
            </div>

            <div className="grid gap-5">
                {courses.length > 0 ? (
                    courses.map((course) => (
                        <div key={course._id} className="group bg-card hover:bg-muted/30 transition-all duration-500 rounded-md border border-border/50 p-6 flex flex-col lg:flex-row lg:items-center gap-6 shadow-soft hover:shadow-2xl hover:border-primary/30 premium-card relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-primary/0 group-hover:bg-primary transition-all duration-500"></div>
                            {/* Course Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                        {course.category}
                                    </span>
                                    {course.isPublished && (
                                        <span className="px-3 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                                            Published
                                        </span>
                                    )}
                                </div>
                                <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors truncate">
                                    {course.title}
                                </h3>
                                <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1.5">
                                        <Icon icon="solar:users-group-rounded-bold-duotone" className="w-4 h-4 text-primary/70" />
                                        {course.enrollments?.length || 0} Students
                                    </span>
                                    <span className="flex items-center gap-1.5">
                                        <Icon icon="solar:star-bold" className="w-4 h-4 text-orange-400" />
                                        {course.rating?.average || 0}
                                    </span>
                                    <span className="flex items-center gap-1.5 font-medium text-foreground">
                                        {course.isFree ? "Free" : `Rs ${course.price}`}
                                    </span>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-wrap items-center gap-2 shrink-0">
                                <button
                                    onClick={() => navigate(`/instructor/students-enrolled?courseId=${course._id}`)}
                                    className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-all text-sm font-medium flex items-center gap-2 border border-transparent hover:border-primary/20"
                                >
                                    <Icon icon="solar:users-group-rounded-bold-duotone" className="w-4 h-4" />
                                    Students
                                </button>
                                <button
                                    onClick={() => handleManageScheduleClick(course)}
                                    className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-all text-sm font-medium flex items-center gap-2 border border-transparent hover:border-primary/20"
                                >
                                    <Icon icon="solar:calendar-bold-duotone" className="w-4 h-4" />
                                    Sessions
                                </button>
                                <button
                                    onClick={() => navigate(`/instructor/batches?courseId=${course._id}`)}
                                    className="px-4 py-2 rounded-md bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-all text-sm font-medium flex items-center gap-2 border border-transparent hover:border-primary/20"
                                >
                                    <Icon icon="solar:layers-minimalistic-bold-duotone" className="w-4 h-4" />
                                    Batches
                                </button>
                                {activeClasses.some(ac => ac.course?._id === course._id) ? (
                                    <button
                                        onClick={() => handleEndSession(course._id)}
                                        className="px-4 py-2 rounded-md bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-destructive/20"
                                    >
                                        <Icon icon="solar:stop-circle-bold-duotone" className="w-4 h-4" />
                                        End Session
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate(`/instructor/livestream/${course._id}`)}
                                        className="px-4 py-2 rounded-md bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-sm font-medium flex items-center gap-2 border border-red-500/20"
                                    >
                                        <Icon icon="solar:play-stream-bold-duotone" className="w-4 h-4" />
                                        Go Live
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate(`/instructor/edit-course/${course._id}`)}
                                    className="p-2 rounded-md bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                                    title="Edit Course"
                                >
                                    <Icon icon="solar:pen-new-square-bold-duotone" className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(course._id)}
                                    className="p-2 rounded-md bg-secondary text-secondary-foreground hover:bg-destructive/10 hover:text-destructive transition-all border border-transparent hover:border-destructive/20"
                                    title="Delete Course"
                                >
                                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-card/30 rounded-md border border-dashed border-border/50">
                        <div className="w-16 h-16 bg-muted rounded-md flex items-center justify-center mx-auto mb-4">
                            <Icon icon="solar:folder-error-bold-duotone" className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium text-foreground">No courses found</h3>
                        <p className="text-sm text-muted-foreground mt-1">Start by creating your first course!</p>
                    </div>
                )}
            </div>

            <ConfirmModal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleConfirmDelete}
                title="Delete Course?"
                message="Are you sure you want to delete this course? This will also delete all its sections and lessons. This action cannot be undone."
                confirmText="Delete"
                type="danger"
            />
            <LiveClassManagementModal
                isOpen={isManagementOpen}
                onClose={() => setIsManagementOpen(false)}
                courseId={selectedCourse?._id}
                courseTitle={selectedCourse?.title}
            />
        </div>
    )
}

export default MyCourses
