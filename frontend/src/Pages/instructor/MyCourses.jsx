import { deleteCourse, getInstructorCourses } from '@/apis/course.api';
import { Icon } from '@iconify/react';
import { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const MyCourses = () => {
    const navigate = useNavigate();
    const { userData } = useContext(AppContext);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchCourses = async () => {
        if (!userData?.id) return;
        try {
            const data = await getInstructorCourses(userData.id);
            setCourses(data);
        } catch (error) {
            console.error("Failed to fetch courses", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCourses();
    }, [userData]);

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this course? This will also delete all its sections and lessons.")) {
            try {
                await deleteCourse(id);
                alert("Course deleted successfully!");
                fetchCourses();
            } catch (error) {
                console.error("Failed to delete course", error);
                alert("Failed to delete course. " + (error.message || ""));
            }
        }
    };

    if (loading) {
        return <div className="p-8 text-center text-gray-500">Loading courses...</div>;
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
                                    <td className="px-6 py-4 text-center">{course.isFree ? "Free" : `$${course.price}`}</td>
                                    <td className="px-6 py-4 text-center">
                                        <button
                                            onClick={() => navigate(`/instructor/edit-course/${course._id}`)}
                                            className="text-blue-600 hover:text-blue-800 mr-3"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(course._id)}
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
        </div>
    )
}

export default MyCourses
