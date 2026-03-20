import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { useGetInstructorStatsQuery } from "@/store/slices/enrollmentApi";

const Dashboard = () => {
    const navigate = useNavigate();
    const { userData } = useSelector((state) => state.auth);
    const { data, isLoading } = useGetInstructorStatsQuery(userData?.id, {
        skip: !userData?.id
    });

    const stats = data?.stats || {
        totalCourses: 0,
        totalEnrollments: 0,
        totalStudents: 0,
        totalRevenue: 0,
        averageRating: 0,
    };

    if (isLoading) {
        return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;
    }

    return (
        <div className="space-y-8 font-outfit">
            
            {/* Top Stats Section - Mix of Large Card and Smaller Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Visits Card - Large Gradient Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-primary to-primary-light rounded-3xl p-8 text-foreground relative overflow-hidden min-h-[300px] flex flex-col justify-center premium-card">
                    <div className="relative z-10 w-full md:w-1/2">
                        <p className="text-blue-100 text-sm font-medium mb-1">Visits for today</p>
                        <h2 className="text-7xl font-bold mb-6">0</h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="p-1 rounded bg-background/20">
                                    <Icon icon="solar:star-bold" />
                                </span>
                                <div>
                                    <p className="text-xs text-blue-100">Popularity</p>
                                    <p className="font-bold">{stats.totalEnrollments}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="p-1 rounded bg-background/20">
                                    <Icon icon="solar:graph-up-bold" />
                                </span>
                                <div>
                                    <p className="text-xs text-blue-100">Average Rating</p>
                                    <p className="font-bold">{stats.averageRating}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button 
                        onClick={() => navigate('/instructor/statistics')}
                        className="absolute bottom-0 right-0 bg-primary-hover text-foreground px-8 py-4 rounded-tl-[2.5rem] font-bold text-sm tracking-wide hover:bg-primary transition-colors flex items-center gap-2"
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
                <div className="bg-accent-soft rounded-3xl p-8 relative flex flex-col justify-between premium-card">
                    <div>
                        <div className="flex justify-between items-start">
                             <p className="font-bold text-gray-800">Popularity rate</p>
                             <span className="bg-background px-2 py-1 rounded-full text-xs font-bold shadow-sm">+0</span>
                        </div>
                        <h2 className="text-6xl font-bold text-gray-900 mt-2">{stats.totalStudents}<span className="text-2xl align-top text-gray-500"> Students</span></h2>
                    </div>

                    {/* Gauge Chart Placeholder */}
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 w-24 h-24 border-8 border-white rounded-full border-t-transparent border-l-transparent rotate-45 opacity-50"></div>

                    <div className="mt-8">
                        <p className="text-xs text-gray-600 leading-relaxed mb-4">
                            Your Rate has increased because of your recent update activity. <span className="font-bold">Keep moving</span> forward and get more points!
                        </p>
                         {/* <div className="bg-background p-3 rounded-xl flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                              <div className="flex items-center gap-3"> */}
                                  {/* <span className="text-accent">
                                      <Icon icon="solar:globus-linear" />
                                  </span> */}
                                 {/* <div className="text-xs text-gray-500 leading-tight">
                                     Learn insights how to manage all <br/> aspects of your startup
                                 </div> */}
                             {/* </div> */}
                             {/* <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center text-foreground">▶</div> */}
                        {/* </div> */}
                    </div>
                </div>
            </div>

            {/* Bottom Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Finance Performance */}
                <div className="bg-background rounded-3xl p-8 shadow-sm premium-card">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800">Finance Performance</h3>
                    </div>
                    
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-foreground font-bold">Rs</div>
                             <div>
                                 <h4 className="text-2xl font-bold text-gray-800">{stats.totalRevenue}</h4>
                                 <p className="text-xs text-gray-400">Total revenue</p>
                             </div>
                        </div>
                        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">
                            <Icon icon="solar:calendar-linear" />
                        </button>
                    </div>

                    {/* Bar Chart Placeholder */}
                    <div className="flex justify-between items-end h-32 px-2">
                        {[40, 60, 30, 80, 50, 90].map((height, i) => (
                            <div key={i} className="group flex flex-col items-center gap-2 w-full">
                                <div className={`w-2 rounded-full transition-all duration-300 group-hover:w-3 ${i === 5 ? 'bg-primary' : 'bg-gray-200'}`} style={{ height: `${height}%` }}></div>
                                <span className="text-[10px] text-gray-400">{['DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Performers */}
                <div className="bg-background rounded-3xl p-8 shadow-sm premium-card">
                    <h3 className="font-bold text-gray-800 mb-6">TOP performers</h3>
                    
                    <div className="space-y-6">
                        {[
                            { name: "Prashiksha Shrestha", status: "Online", score: "0", seed: "Bessie" },
                            { name: "Sachin Sharma", status: "Online", score: "0", seed: "Albert" },
                            { name: "Siddhant Dhungel", status: "Offline", score: "0", seed: "Guy" },
                        ].map((user, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 overflow-hidden shadow-sm border border-gray-100">
                                        <Icon icon="solar:user-circle-bold-duotone" size={24} />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-800">{user.name}</p>
                                        <div className="flex items-center gap-1">
                                            {user.status === 'Online' && <div className="w-2 h-2 bg-green-400 rounded-full"></div>}
                                            <p className="text-xs text-gray-400">{user.status}</p>
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-2 py-1 rounded-lg text-xs font-bold ${user.score > 4.5 ? 'bg-blue-50 text-blue-600' : 'bg-red-50 text-red-500'}`}>{user.score}</span>
                            </div>
                        ))}
                    </div>
                </div>

                 {/* Top Performers - Targeting Region Placeholder */}
                 {/* <div className="bg-background rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-gray-800">Targeting by region</h3>
                    </div>
                     */}
                    {/* Map Placeholder
                    <div className="w-full h-40 bg-gray-50 rounded-xl relative opacity-50 mt-4" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '10px 10px' }}> */}
                        {/* Dot markers */}
                        {/* <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-primary/20 rounded-full flex items-center justify-center animate-pulse">
                            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        </div>
                        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-primary/20 rounded-full flex items-center justify-center animate-pulse animation-delay-500">
                             <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                        </div> */}

                         {/* Tooltip Card */}
                         {/* <div className="absolute top-4 right-8 bg-background p-2 rounded-lg shadow-lg flex items-center gap-2 border border-gray-100 animate-bounce">
                             <div className="w-6 h-6 rounded bg-gray-200 overflow-hidden"> */}
                                 {/* Flag placeholder */}
                                 {/* <img src="https://flagcdn.com/w40/pl.png" alt="Poland" className="w-full h-full object-cover" />
                             </div>
                             <div>
                                 <p className="text-xs font-bold">Poland</p>
                                 <p className="text-[10px] text-green-500">0% ▲ 0</p>
                             </div>
                         </div>
                    </div>
                </div> */}

            </div>
        </div>
    );
};

export default Dashboard;
