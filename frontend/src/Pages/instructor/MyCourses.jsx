import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetInstructorCoursesQuery, useDeleteCourseMutation } from '@/store/slices/courseApi';
import ConfirmModal from '@/components/common/ConfirmModal';
import ScheduleClassModal from '@/components/instructor/ScheduleClassModal';
import { useToast } from '@/context/ToastContext';
import { 
    useGetInstructorActiveClassesQuery, 
    useEndAllCourseLiveClassesMutation 
} from '@/store/slices/liveClassApi';

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
    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const handleScheduleClick = (course) => {
        setSelectedCourse(course);
        setIsScheduleOpen(true);
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
        return <div className="p-8 text-center text-gray-500">Loading courses...</div>;
    }

    if (isError) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Failed to load courses</p>
                <button
                    onClick={refetch}
                    className="px-4 py-2 bg-blue-600 text-foreground rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-card/50 backdrop-blur-sm p-6 rounded-2xl border border-border/50 shadow-soft">
                <div>
                    <h1 className="text-2xl font-bold text-foreground">My Courses</h1>
                    <p className="text-sm text-muted-foreground mt-1">Manage and monitor your educational content</p>
                </div>
                <button
                    onClick={() => navigate('/instructor/add-course')}
                    className="w-full md:w-auto px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:opacity-90 transition-all shadow-lg shadow-primary/20 font-medium flex items-center justify-center gap-2"
                >
                    <Icon icon="solar:add-circle-bold" className="w-5 h-5" />
                    Add New Course
                </button>
            </div>

            <div className="grid gap-4">
                {courses.length > 0 ? (
                    courses.map((course) => (
                        <div key={course._id} className="group bg-card hover:bg-accent/5 transition-all duration-300 rounded-2xl border border-border/50 p-5 flex flex-col lg:flex-row lg:items-center gap-6 shadow-soft hover:shadow-lg hover:border-primary/20">
                            {/* Course Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                                        {course.category}
                                    </span>
                                    {course.isPublished && (
                                        <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
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
                                    onClick={() => handleScheduleClick(course)}
                                    className="px-4 py-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-all text-sm font-medium flex items-center gap-2"
                                >
                                    <Icon icon="solar:calendar-add-bold-duotone" className="w-4 h-4" />
                                    Schedule
                                </button>
                                {activeClasses.some(ac => ac.course?._id === course._id) ? (
                                    <button
                                        onClick={() => handleEndSession(course._id)}
                                        className="px-4 py-2 rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all text-sm font-bold flex items-center gap-2 shadow-lg shadow-destructive/20"
                                    >
                                        <Icon icon="solar:stop-circle-bold-duotone" className="w-4 h-4" />
                                        End Session
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => navigate(`/instructor/livestream/${course._id}`)}
                                        className="px-4 py-2 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all text-sm font-medium flex items-center gap-2 border border-red-500/20"
                                    >
                                        <Icon icon="solar:play-stream-bold-duotone" className="w-4 h-4" />
                                        Go Live
                                    </button>
                                )}
                                <button
                                    onClick={() => navigate(`/instructor/edit-course/${course._id}`)}
                                    className="p-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-primary/10 hover:text-primary transition-all border border-transparent hover:border-primary/20"
                                    title="Edit Course"
                                >
                                    <Icon icon="solar:pen-new-square-bold-duotone" className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => handleDeleteClick(course._id)}
                                    className="p-2 rounded-xl bg-secondary text-secondary-foreground hover:bg-destructive/10 hover:text-destructive transition-all border border-transparent hover:border-destructive/20"
                                    title="Delete Course"
                                >
                                    <Icon icon="solar:trash-bin-trash-bold-duotone" className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-card/30 rounded-3xl border border-dashed border-border/50">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
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
            <ScheduleClassModal
                isOpen={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
                courseId={selectedCourse?._id}
                courseTitle={selectedCourse?.title}
            />
        </div>
    )
}

export default MyCourses
