import { Icon } from '@iconify/react';

const Analytics = () => {
  const courseStats = [
    { name: 'Web Development Fundamentals', views: 1234, completions: 456, rating: 4.8 },
    { name: 'Advanced React Patterns', views: 892, completions: 234, rating: 4.9 },
    { name: 'Node.js Backend Development', views: 756, completions: 189, rating: 4.7 },
  ];

  return (
    <div className="p-6 font-outfit">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Analytics & Reports</h1>
        <p className="text-gray-600">Track your course performance and student engagement.</p>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: 'Total Views', value: '2,882', icon: 'solar:eye-bold', color: 'bg-blue-500' },
          { label: 'Completions', value: '879', icon: 'solar:graph-up-bold', color: 'bg-green-500' },
          { label: 'Active Students', value: '156', icon: 'solar:users-group-rounded-bold', color: 'bg-purple-500' },
          { label: 'Avg. Rating', value: '4.8', icon: 'solar:star-bold', color: 'bg-orange-500' },
        ].map((stat, idx) => {
          return (
            <div key={idx} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <div className={`${stat.color} p-3 rounded-lg w-fit mb-4`}>
                <Icon icon={stat.icon} className="w-6 h-6 text-white" />
              </div>
              <p className="text-gray-600 text-sm mb-1">{stat.label}</p>
              <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Course Performance Table */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Course Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 text-gray-600 font-medium text-sm">
              <tr>
                <th className="text-left px-6 py-4">Course Name</th>
                <th className="text-center px-6 py-4">Views</th>
                <th className="text-center px-6 py-4">Completions</th>
                <th className="text-center px-6 py-4">Rating</th>
                <th className="text-center px-6 py-4">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {courseStats.map((course, idx) => (
                <tr key={idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{course.name}</td>
                  <td className="px-6 py-4 text-center text-gray-700">{course.views}</td>
                  <td className="px-6 py-4 text-center text-gray-700">{course.completions}</td>
                  <td className="px-6 py-4 text-center">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center justify-center gap-1">
                      <Icon icon="solar:star-bold" className="text-orange-400" /> {course.rating}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(course.completions / course.views) * 100}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">
                        {Math.round((course.completions / course.views) * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
