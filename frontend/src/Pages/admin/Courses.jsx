import { useGetAdminCoursesQuery } from "@/store/slices/siteApi";

const AdminCourses = () => {
  const { data, isLoading } = useGetAdminCoursesQuery({ limit: 50 });
  const courses = data?.courses || [];

  if (isLoading) {
    return <div className="text-muted-foreground">Loading courses...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Course Moderation</h1>
        <p className="text-muted-foreground mt-1">Review, approve, and manage system-wide courses.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {courses.length > 0 ? courses.map((course) => (
          <div key={course._id || course.title} className="bg-background p-6 rounded-md border border-border shadow-sm flex items-center justify-between hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-16 h-12 bg-secondary rounded-md" />
              <div>
                <h3 className="font-bold text-foreground">{course.title}</h3>
                <p className="text-xs text-muted-foreground">
                  Instructor: {course.teacher?.name || "Unknown"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-12 text-right">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Price</p>
                <p className="text-sm font-bold text-foreground">
                  {course.isFree || Number(course.price) === 0 ? "Free" : `Rs. ${Number(course.price || 0).toLocaleString()}`}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Status</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${course.status === 'published' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  {course.status}
                </span>
              </div>
              <button className="text-sm font-bold text-muted-foreground hover:text-foreground border border-border px-4 py-2 rounded-md transition-all">
                Details
              </button>
            </div>
          </div>
        )) : (
          <div className="rounded-md border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No courses found.
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCourses;
