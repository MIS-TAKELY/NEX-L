export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-4">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="font-semibold text-lg">Courses</h2>
          <p className="text-gray-500 mt-2">You are enrolled in 3 courses</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="font-semibold text-lg">Progress</h2>
          <p className="text-gray-500 mt-2">Your progress is 45%</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow">
          <h2 className="font-semibold text-lg">Notifications</h2>
          <p className="text-gray-500 mt-2">You have 2 new messages</p>
        </div>
      </div>
    </div>
  );
}
