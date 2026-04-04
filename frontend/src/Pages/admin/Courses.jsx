const AdminCourses = () => {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Course Moderation</h1>
        <p className="text-muted-foreground mt-1">Review, approve, and manage system-wide courses.</p>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {[
          { title: 'Full-Stack MERN Stack', instructor: 'Mr. Ram', students: 482, status: 'Published' },
          { title: 'Python for AI', instructor: 'Mr. Shyam', students: 125, status: 'Draft' },
          { title: 'Advanced DSA', instructor: 'Ms. Sita', students: 89, status: 'Published' },
        ].map((course) => (
          <div key={course.title} className="bg-background p-6 rounded-md border border-border shadow-sm flex items-center justify-between hover:border-primary/20 transition-all">
            <div className="flex items-center gap-4">
              <div className="w-16 h-12 bg-secondary rounded-md" />
              <div>
                <h3 className="font-bold text-foreground">{course.title}</h3>
                <p className="text-xs text-muted-foreground">Instructor: {course.instructor}</p>
              </div>
            </div>
            <div className="flex items-center gap-12 text-right">
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Students</p>
                <p className="text-sm font-bold text-foreground">{course.students}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-muted-foreground uppercase">Status</p>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${course.status === 'Published' ? 'bg-primary/10 text-primary' : 'bg-secondary text-muted-foreground'}`}>
                  {course.status}
                </span>
              </div>
              <button className="text-sm font-bold text-muted-foreground hover:text-foreground border border-border px-4 py-2 rounded-md transition-all">
                Details
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCourses;
