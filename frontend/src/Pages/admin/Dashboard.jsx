import { useGetAdminStatsQuery } from "@/store/slices/siteApi";

const AdminDashboard = () => {
  const { data, isLoading } = useGetAdminStatsQuery();

  const stats = data
    ? [
        { label: "Total Users", value: data.totalUsers, color: "primary" },
        { label: "Total Courses", value: data.totalCourses, color: "accent" },
        { label: "Pending Courses", value: data.pendingCourses, color: "primary-light" },
        { label: "Enrollments", value: data.totalEnrollments, color: "accent-soft" },
      ]
    : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-foreground">System Overview</h1>
        <p className="text-muted-foreground">Loading live dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">System Overview</h1>
        <p className="text-muted-foreground mt-1">Here's what's happening across NEXL today.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-background p-6 rounded-md shadow-sm border border-border">
            <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
            <div className="flex items-end justify-between mt-2">
              <h3 className="text-2xl font-bold text-foreground">{Number(stat.value || 0).toLocaleString()}</h3>
              <span className={`text-xs font-bold px-2 py-1 rounded-md ${
                stat.color === 'primary' ? 'bg-primary/10 text-primary' :
                stat.color === 'accent' ? 'bg-accent/10 text-accent' :
                stat.color === 'primary-light' ? 'bg-primary-light/10 text-primary-light' :
                'bg-accent-soft text-accent'
              }`}>
                Live
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-background p-8 rounded-md border border-border shadow-sm min-h-80">
          <h3 className="text-xl font-bold text-foreground mb-6">Active Instructors</h3>
          <div className="space-y-4">
            {(data?.activeInstructors || []).length > 0 ? data.activeInstructors.map((instructor) => (
              <div key={instructor.name} className="flex items-center justify-between rounded-md border border-border p-4">
                <div>
                  <p className="font-semibold text-foreground">{instructor.name}</p>
                  <p className="text-sm text-muted-foreground">{Number(instructor.courseCount || 0)} courses</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-foreground">{Number(instructor.avgRating || 0).toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Avg rating</p>
                </div>
              </div>
            )) : (
              <p className="text-muted-foreground">No published instructors found yet.</p>
            )}
          </div>
        </div>
        <div className="bg-background p-8 rounded-md border border-border shadow-sm min-h-80 flex items-center justify-center text-muted-foreground">
          Live backend statistics are now wired in. Add revenue analytics here when the backend exposes them.
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
