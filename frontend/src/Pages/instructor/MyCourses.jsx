import { useNavigate } from 'react-router-dom';

const MyCourses = () => {
  const navigate = useNavigate();

  // Mock Data
  const courses = [
    {
       id: 1,
       name: "Complete Web Development Bootcamp",
       students: 120,
       rating: 4.8,
       status: "Published",
       price: "$49.99"
    },
    {
       id: 2,
       name: "Advanced React Patterns",
       students: 45,
       rating: 4.9,
       status: "Published",
       price: "$59.99"
    },
    {
       id: 3,
       name: "Node.js for Beginners",
       students: 0,
       rating: 0,
       status: "Draft",
       price: "$39.99"
    }
  ];

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
              <th className="text-center px-6 py-4">Status</th>
              <th className="text-center px-6 py-4">Price</th>
              <th className="text-center px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {courses.length > 0 ? (
                courses.map((course) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{course.name}</td>
                    <td className="px-6 py-4 text-center">{course.students}</td>
                    <td className="px-6 py-4 text-center">
                        <span className="flex items-center justify-center gap-1">
                            <Icon icon="solar:star-bold" className="text-orange-400" /> {course.rating}
                        </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            course.status === 'Published' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                            {course.status}
                        </span>
                    </td>
                     <td className="px-6 py-4 text-center">{course.price}</td>
                    <td className="px-6 py-4 text-center">
                       <button className="text-blue-600 hover:text-blue-800 mr-3">Edit</button>
                       <button className="text-red-600 hover:text-red-800">Delete</button>
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

