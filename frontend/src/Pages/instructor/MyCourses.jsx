import { Icon } from '@iconify/react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useGetInstructorCoursesQuery, useDeleteCourseMutation } from '@/store/slices/courseApi';
import ConfirmModal from '@/components/common/ConfirmModal';
import { useToast } from '@/context/ToastContext';

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

    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState(null);

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

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading courses...</div>;
    }

    if (isError) {
        return (
            <div className="p-8 text-center">
                <p className="text-red-500 mb-4">Failed to load courses</p>
                <button
                    onClick={refetch}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
                <h1 className="text-xl font-bold text-gray-800">My Courses</h1>
                <button
                    onClick={() => navigate('/instructor/add-course')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    Add New Course
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
                        <tr>
                            <th className="text-left px-6 py-4">Course Name</th>
                            <th className="text-center px-6 py-4">Students</th>
                            <th className="text-center px-6 py-4">Rating</th>
                            <th className="text-center px-6 py-4">Category</th>
                            <th className="text-center px-6 py-4">Price</th>
                            <th className="text-center px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
                        {courses.length > 0 ? (
                            courses.map((course) => (
                                <tr key={course._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-gray-900">{course.title}</td>
                                    <td className="px-6 py-4 text-center">{course.enrollments?.length || 0}</td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="flex items-center justify-center gap-1">
                                            <Icon icon="solar:star-bold" className="text-orange-400" /> {course.rating?.average || 0}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className={`px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700`}>
                                            {course.category}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">{course.isFree ? "Free" : `Rs ${course.price}`}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => navigate(`/instructor/edit-course/${course._id}`)}
                                            className="text-blue-600 hover:text-blue-800 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(course._id)}
                                            className="text-red-600 hover:text-red-800"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="6" className="text-center py-8 text-gray-500">
                                    No courses found. Start by creating one!
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
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
        </div>
    )
}

export default MyCourses
