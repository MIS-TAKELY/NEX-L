import { useSelector } from "react-redux";
import { useGetInstructorStudentsQuery } from "@/store/slices/enrollmentApi";

const StudentsEnrolled = () => {
  const { userData } = useSelector((state) => state.auth);
  const { data, isLoading } = useGetInstructorStudentsQuery(userData?.id, {
    skip: !userData?.id
  });

  const students = data?.students || [];

  if (isLoading) {
    return <div className="p-8 text-center text-gray-500">Loading students...</div>;
  }

  return (
    <div className="bg-background rounded-xl shadow-sm border border-gray-100 overflow-hidden">
       <div className="p-6 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-800">Students Enrolled</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
            <tr>
              <th className="text-left px-6 py-4">Student Name</th>
              <th className="text-left px-6 py-4">Enrolled Course</th>
              <th className="text-center px-6 py-4">Progress</th>
              <th className="text-center px-6 py-4">Enrolled Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-sm text-gray-700">
            {students.map((student) => (
              <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">
                        {student.name.charAt(0)}
                    </div>
                    <span className="font-medium text-gray-900">{student.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">{student.course}</td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                      <div 
                        className="bg-green-500 h-2 rounded-full" 
                        style={{ width: `${student.progress}%` }}
                      ></div>
                    </div>
                    <span className="text-xs text-gray-500">{student.progress}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">{new Date(student.date).toLocaleDateString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StudentsEnrolled;
