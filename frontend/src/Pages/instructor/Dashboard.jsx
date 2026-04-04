import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Icon } from '@iconify/react';
import { useGetInstructorStatsQuery, useGetInstructorStudentsQuery } from "@/store/slices/enrollmentApi";
import DashboardSkeleton from "@/components/skeletons/DashboardSkeleton";

const Dashboard = () => {
    const navigate = useNavigate();
    const { userData } = useSelector((state) => state.auth);
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

    return (
        <div className="space-y-8 font-outfit text-foreground">
            
            {/* Top Stats Section - Mix of Large Card and Smaller Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Visits Card - Large Gradient Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-primary to-accent rounded-md p-8 text-primary-foreground relative overflow-hidden min-h-[300px] flex flex-col justify-center premium-card shadow-lg shadow-primary/20">
                    <div className="relative z-10 w-full md:w-1/2">
                        <p className="text-primary-foreground/80 text-sm font-medium mb-1">Visits for today</p>
                        <h2 className="text-7xl font-bold mb-6">0</h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="p-1 rounded bg-card/20">
                                    <Icon icon="solar:star-bold" />
                                </span>
                                <div>
                                    <p className="text-xs text-primary-foreground/80">Popularity</p>
                                    <p className="font-bold">{stats.totalEnrollments}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="p-1 rounded bg-card/20">
                                    <Icon icon="solar:graph-up-bold" />
                                </span>
                                <div>
                                    <p className="text-xs text-primary-foreground/80">Average Rating</p>
                                    <p className="font-bold">{stats.averageRating}</p>
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

                    {/* Illustration Placeholder */}
                    <div className="absolute top-8 right-8 w-1/2 h-full pointer-events-none hidden md:block">
                         {/* Circle/Character Illustration placeholder */}
                         <div className="w-full h-full bg-contain bg-no-repeat bg-center opacity-90" style={{ backgroundImage: 'url("https://cdn3d.iconscout.com/3d/premium/thumb/man-working-on-laptop-2996954-2492508.png")' }}></div>
                    </div>
                </div>

                {/* Popularity Rate Card */}
                <div className="bg-card rounded-md p-8 relative flex flex-col justify-between premium-card border border-border shadow-sm">
                    <div>
                        <div className="flex justify-between items-start">
                             <p className="font-bold text-foreground">Popularity rate</p>
                             <span className="bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded-md text-xs font-bold shadow-sm">+0</span>
                        </div>
                        <h2 className="text-6xl font-bold text-foreground mt-2">{stats.totalStudents}<span className="text-2xl align-top text-muted-foreground"> Students</span></h2>
                    </div>

                    {/* Gauge Chart Placeholder */}
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 w-24 h-24 border-8 border-primary/10 rounded-md border-t-transparent border-l-transparent rotate-45 opacity-50"></div>

                    <div className="mt-8">
                        <p className="text-xs text-muted-foreground leading-relaxed mb-4 font-medium">
                            Your Rate has increased because of your recent update activity. <span className="font-bold text-primary">Keep moving</span> forward and get more points!
                        </p>
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
                                 <h4 className="text-2xl font-bold text-foreground">{stats.totalRevenue}</h4>
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
                                <div className={`w-2 rounded-md transition-all duration-300 group-hover:w-3 ${i === 5 ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.5)]' : 'bg-muted'}`} style={{ height: `${height}%` }}></div>
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
            </div>
        </div>
    );
};

export default Dashboard;
