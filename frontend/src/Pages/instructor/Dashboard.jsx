import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Icon } from '@iconify/react';
import { useGetInstructorStatsQuery, useGetInstructorStudentsQuery } from "@/store/slices/enrollmentApi";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";

const Dashboard = () => {
    const navigate = useNavigate();
    const { userData } = useSelector((state) => state.auth);
    const displayName = userData?.name || "Instructor";

    const { data, isLoading } = useGetInstructorStatsQuery(userData?.id, {
        skip: !userData?.id
    });
    const { data: studentsData, isLoading: loadingStudents } = useGetInstructorStudentsQuery(userData?.id, {
        skip: !userData?.id
    });

    const stats = data?.stats || {
        totalCourses: 0,
        totalEnrollments: 0,
        totalStudents: 0,
        totalRevenue: 0,
        averageRating: 0,
    };

    if (isLoading || loadingStudents) {
        return <DashboardSkeleton />;
    }

    const topPerformers = studentsData?.students 
        ? [...studentsData.students].sort((a, b) => b.progress - a.progress).slice(0, 3) 
        : [];

    const quickActions = [
        { label: "Add New Course", icon: "solar:add-circle-bold", path: "/instructor/add-course", color: "bg-primary/10 text-primary border-primary/20" },
        { label: "View Analytics", icon: "solar:graph-up-bold", path: "/instructor/analytics", color: "bg-accent/10 text-accent border-accent/20" },
        { label: "My Courses", icon: "solar:notebook-bold", path: "/instructor/courses", color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
        { label: "Messages", icon: "solar:chat-round-dots-bold", path: "/instructor/messages", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    ];

    return (
        <div className="space-y-8 font-outfit text-foreground">
            
            {/* Top Stats Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Welcome Card - Large Gradient Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-primary to-accent rounded-md p-8 text-primary-foreground relative overflow-hidden min-h-[300px] flex flex-col justify-center premium-card shadow-lg shadow-primary/20">
                    <div className="relative z-10 w-full md:w-1/2">
                        <p className="text-primary-foreground/80 text-sm font-medium mb-1 tracking-wide uppercase">
                            Welcome back,
                        </p>
                        <h2 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
                            {displayName} 👋
                        </h2>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="p-1.5 rounded-md bg-card/20 backdrop-blur-sm">
                                    <Icon icon="solar:notebook-bold" className="w-4 h-4" />
                                </span>
                                <div>
                                    <p className="text-[10px] text-primary-foreground/70 uppercase tracking-wider font-semibold">Total Courses</p>
                                    <p className="font-bold text-lg">{stats.totalCourses}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="p-1.5 rounded-md bg-card/20 backdrop-blur-sm">
                                    <Icon icon="solar:users-group-rounded-bold" className="w-4 h-4" />
                                </span>
                                <div>
                                    <p className="text-[10px] text-primary-foreground/70 uppercase tracking-wider font-semibold">Total Students</p>
                                    <p className="font-bold text-lg">{stats.totalStudents}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="p-1.5 rounded-md bg-card/20 backdrop-blur-sm">
                                    <Icon icon="solar:graph-up-bold" className="w-4 h-4" />
                                </span>
                                <div>
                                    <p className="text-[10px] text-primary-foreground/70 uppercase tracking-wider font-semibold">Average Rating</p>
                                    <p className="font-bold text-lg">
                                        {stats.averageRating}
                                        <span className="text-sm text-primary-foreground/80 ml-1">/ 5</span>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/instructor/statistics')}
                        className="absolute bottom-0 right-0 bg-card/10 backdrop-blur-md text-primary-foreground px-8 py-4 rounded-tl-[2.5rem] font-bold text-sm tracking-wide hover:bg-card/20 transition-all flex items-center gap-2 border-l border-t border-white/20"
                    >
                        VIEW FULL STATISTIC <Icon icon="solar:alt-arrow-right-linear" />
                    </button>

                    {/* Illustration */}
                    <div className="absolute top-8 right-8 w-1/2 h-full pointer-events-none hidden md:block">
                         <div className="w-full h-full bg-contain bg-no-repeat bg-center opacity-90" style={{ backgroundImage: 'url("https://cdn3d.iconscout.com/3d/premium/thumb/man-working-on-laptop-2996954-2492508.png")' }}></div>
                    </div>
                </div>

                {/* Performance Summary Card */}
                <div className="bg-card rounded-md p-8 relative flex flex-col premium-card border border-border shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Performance</h3>
                        <span className="bg-primary/10 text-primary border border-primary/20 px-2.5 py-1 rounded-md text-[10px] font-bold shadow-sm">
                            {stats.totalEnrollments} enrolled
                        </span>
                    </div>

                    {/* Revenue - Big Number */}
                    <div className="mb-6">
                        <p className="text-xs text-muted-foreground font-medium mb-1">Total Revenue</p>
                        <h2 className="text-4xl font-bold text-foreground">
                            Rs {stats.totalRevenue.toLocaleString()}
                        </h2>
                    </div>

                    {/* Rating Display */}
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-md border border-border/50">
                        <div className="flex items-center gap-2">
                            <Icon icon="solar:star-bold" className="text-amber-500 w-5 h-5" />
                            <span className="text-sm font-bold text-foreground">Average Rating</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-2xl font-extrabold text-foreground">{stats.averageRating}</span>
                            <span className="text-xs text-muted-foreground font-medium">/ 5</span>
                        </div>
                    </div>

                    {/* Mini stat row */}
                    <div className="grid grid-cols-2 gap-3 mt-4">
                        <div className="p-3 bg-muted/20 rounded-md border border-border/40">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Courses</p>
                            <p className="text-xl font-bold text-foreground mt-1">{stats.totalCourses}</p>
                        </div>
                        <div className="p-3 bg-muted/20 rounded-md border border-border/40">
                            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Students</p>
                            <p className="text-xl font-bold text-foreground mt-1">{stats.totalStudents}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Finance Performance */}
                <div className="bg-card rounded-md p-8 shadow-sm premium-card border border-border">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-foreground">Finance Performance</h3>
                    </div>
                    
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold">Rs</div>
                             <div>
                                 <h4 className="text-2xl font-bold text-foreground">Rs {stats.totalRevenue.toLocaleString()}</h4>
                                 <p className="text-xs text-muted-foreground font-medium">Total revenue</p>
                             </div>
                        </div>
                        <button className="w-8 h-8 rounded-md border border-border flex items-center justify-center text-muted-foreground hover:bg-muted transition-colors">
                            <Icon icon="solar:calendar-linear" />
                        </button>
                    </div>

                    {/* Bar Chart Placeholder */}
                    <div className="flex justify-between items-end h-32 px-2">
                        {[40, 60, 30, 80, 50, 90].map((height, i) => (
                            <div key={i} className="group flex flex-col items-center gap-2 w-full">
                                <div className="h-24 w-full flex items-end justify-center">
                                    <div 
                                        className={`w-2 rounded-md transition-all duration-300 group-hover:w-3 ${
                                            i === 5 
                                                ? 'bg-primary shadow-[0_0_10px_rgba(99,102,241,0.5)]' 
                                                : 'bg-primary/20 hover:bg-primary/40'
                                        }`} 
                                        style={{ height: `${height}%` }}
                                    ></div>
                                </div>
                                <span className="text-[10px] text-muted-foreground font-bold">{['DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Performers */}
                <div className="bg-card rounded-md p-8 shadow-sm premium-card border border-border">
                    <h3 className="font-bold text-foreground mb-6 uppercase tracking-wider text-sm">TOP performers</h3>
                                       <div className="space-y-6">
                        {topPerformers.length > 0 ? topPerformers.map((student, i) => (
                            <div key={i} className="flex items-center justify-between group">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center text-primary overflow-hidden shadow-sm border border-primary/10 group-hover:border-primary/30 transition-colors">
                                        {student.avatar ? (
                                            <img src={student.avatar} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <Icon icon="solar:user-circle-bold-duotone" size={24} />
                                        )}
                                    </div>
                                    <div className="max-w-[140px]">
                                        <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{student.name}</p>
                                        <div className="flex items-center gap-1">
                                            <p className="text-[10px] text-muted-foreground truncate font-medium">{student.course}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className="px-2 py-1 rounded-md text-[10px] font-black bg-primary/10 text-primary block mb-1 border border-primary/20">{student.progress}%</span>
                                    <div className="w-16 h-1 bg-muted rounded-md overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-primary to-accent" style={{ width: `${student.progress}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center py-8">
                                <div className="w-12 h-12 bg-muted rounded-md flex items-center justify-center mx-auto mb-3">
                                    <Icon icon="solar:users-group-rounded-bold-duotone" className="text-muted-foreground w-6 h-6" />
                                </div>
                                <p className="text-muted-foreground text-sm font-medium italic">No enrollments yet</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-card rounded-md p-8 shadow-sm premium-card border border-border">
                    <h3 className="font-bold text-foreground mb-6 uppercase tracking-wider text-sm">Quick Actions</h3>
                    
                    <div className="space-y-3">
                        {quickActions.map((action, idx) => (
                            <button
                                key={idx}
                                onClick={() => navigate(action.path)}
                                className={`w-full flex items-center gap-3 p-4 rounded-md border ${action.color} hover:shadow-md transition-all duration-200 group text-left`}
                            >
                                <span className="p-2 rounded-md bg-background/50">
                                    <Icon icon={action.icon} className="w-5 h-5" />
                                </span>
                                <span className="text-sm font-bold text-foreground flex-1 group-hover:translate-x-0.5 transition-transform">
                                    {action.label}
                                </span>
                                <Icon icon="solar:alt-arrow-right-linear" className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all" />
                            </button>
                        ))}
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-md border border-primary/10">
                        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                            💡 <span className="font-bold text-foreground">Pro tip:</span> Keep your courses updated with fresh content to boost student engagement and ratings!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
