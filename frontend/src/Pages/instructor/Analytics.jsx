import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { useGetInstructorAnalyticsQuery } from '@/store/slices/courseApi';
import { Loader2 } from "lucide-react";

const Analytics = () => {
  const { userData } = useSelector((state) => state.auth);
  const teacherId = userData?.id;

  const { data: analyticsResponse, isLoading, isError } = useGetInstructorAnalyticsQuery(teacherId, {
    skip: !teacherId,
  });

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center items-center h-[50vh]">
        <Loader2 className="animate-spin text-primary w-12 h-12" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center text-red-500 font-bold h-[50vh] flex justify-center items-center">
        Failed to load analytics data.
      </div>
    );
  }

  const overview = analyticsResponse?.data?.overview || {
    totalViews: 0,
    totalCompletions: 0,
    activeStudents: 0,
    avgRating: 0
  };

  const courseStats = analyticsResponse?.data?.courseStats || [];

  return (
    <div className="bg-background text-foreground p-6 md:p-10 min-h-screen font-sans border-0 w-full">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent tracking-tight drop-shadow-sm mb-2">Analytics & Reports</h1>
          <p className="text-muted-foreground font-medium tracking-wide">Track your course performance and student engagement.</p>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: 'Total Views', value: overview.totalViews.toLocaleString(), icon: 'solar:eye-bold', color: 'bg-blue-500/10 text-blue-400 ring-blue-500/20' },
          { label: 'Completions', value: overview.totalCompletions.toLocaleString(), icon: 'solar:graph-up-bold', color: 'bg-emerald-500/10 text-emerald-400 ring-emerald-500/20' },
          { label: 'Active Students', value: overview.activeStudents.toLocaleString(), icon: 'solar:users-group-rounded-bold', color: 'bg-violet-500/10 text-violet-400 ring-violet-500/20' },
          { label: 'Avg. Rating', value: overview.avgRating, icon: 'solar:star-bold', color: 'bg-orange-500/10 text-orange-400 ring-orange-500/20' },
        ].map((stat, idx) => {
          return (
            <div key={idx} className="bg-card rounded-2xl p-6 border border-border shadow-sm relative overflow-hidden group premium-card">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className={`${stat.color} p-3 rounded-xl w-fit mb-4 ring-1 ring-inset backdrop-blur-md`}>
                <Icon icon={stat.icon} className="w-6 h-6" />
              </div>
              <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-2">{stat.label}</p>
              <p className="text-3xl font-extrabold text-foreground">{stat.value}</p>
            </div>
          );
        })}
      </div>

      {/* Course Performance Table */}
      <div className="max-w-7xl mx-auto bg-card rounded-2xl p-6 border border-border shadow-sm premium-card">
        <h2 className="text-xl font-bold text-foreground mb-6">Course Performance</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-muted/50 text-muted-foreground font-bold text-[11px] uppercase tracking-wider rounded-xl overflow-hidden shadow-inner">
              <tr>
                <th className="text-left px-6 py-4 rounded-tl-lg">Course Name</th>
                <th className="text-center px-6 py-4">Views</th>
                <th className="text-center px-6 py-4">Completions</th>
                <th className="text-center px-6 py-4">Rating</th>
                <th className="text-center px-6 py-4 rounded-tr-lg">Completion Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {courseStats.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center text-muted-foreground font-medium bg-muted/5">
                    No course data available yet.
                  </td>
                </tr>
              ) : (
                courseStats.map((course, idx) => {
                  const viewCount = course.views || 0;
                  const completions = course.completions || 0;
                  const completionRate = course.averageProgress || 0;
                  
                  return (
                    <tr key={idx} className="hover:bg-muted/10 transition-all duration-200 group">
                      <td className="px-6 py-5 font-bold text-foreground group-hover:text-primary transition-colors">{course.name}</td>
                      <td className="px-6 py-5 text-center text-muted-foreground font-medium">{viewCount}</td>
                      <td className="px-6 py-5 text-center text-muted-foreground font-medium">{completions}</td>
                      <td className="px-6 py-5 text-center">
                        <span className="px-3 py-1.5 bg-amber-500/10 text-amber-500 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 w-fit mx-auto border border-amber-500/20">
                          <Icon icon="solar:star-bold" className="text-amber-500" /> {course.rating.toFixed(1)}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-center">
                        <div className="flex items-center justify-center gap-4">
                          <div className="w-24 h-2 bg-muted rounded-full overflow-hidden border border-border">
                            <div 
                              className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(139,92,246,0.3)]"
                              style={{ width: `${completionRate}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-muted-foreground w-10 text-right">
                            {completionRate}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
