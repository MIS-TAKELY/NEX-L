import { Icon } from '@iconify/react';
import { useSelector } from 'react-redux';
import { useGetInstructorStatsQuery } from '@/store/slices/enrollmentApi';

const Statistics = () => {
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

    if (isLoading) return <div className="p-8 text-center text-muted-foreground">Loading statistics...</div>;

    return (
        <div className="space-y-8 font-outfit">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Full Statistics</h1>
                    <p className="text-muted-foreground mt-1">Comprehensive analytics and performance metrics</p>
                </div>
                <button className="px-6 py-3 bg-primary text-foreground rounded-md font-semibold hover:bg-primary/90 transition-colors">
                    Export Report
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-card rounded-md p-6 shadow-sm border border-border premium-card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-md bg-primary/10 flex items-center justify-center text-primary">
                            <Icon icon="solar:eye-bold" className="text-2xl" />
                        </div>
                        <span className="text-xs text-emerald-500 font-semibold">+0%</span>
                    </div>
                    <h3 className="text-3xl font-bold text-foreground">{stats.totalEnrollments * 5}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Total Visits (Est.)</p>
                </div>

                <div className="bg-card rounded-md p-6 shadow-sm border border-border premium-card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                            <Icon icon="solar:notebook-bold" className="text-2xl" />
                        </div>
                        <span className="text-xs text-emerald-500 font-semibold">+0%</span>
                    </div>
                    <h3 className="text-3xl font-bold text-foreground">{stats.totalEnrollments}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Course Enrollments</p>
                </div>

                <div className="bg-card rounded-md p-6 shadow-sm border border-border premium-card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-md bg-accent/10 flex items-center justify-center text-accent">
                            <Icon icon="solar:star-bold" className="text-2xl" />
                        </div>
                        <span className="text-xs text-muted-foreground font-semibold">{stats.averageRating}</span>
                    </div>
                    <h3 className="text-3xl font-bold text-foreground">{stats.averageRating}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Average Rating</p>
                </div>

                <div className="bg-card rounded-md p-6 shadow-sm border border-border premium-card">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-500">
                            <Icon icon="solar:wad-of-money-bold" className="text-2xl" />
                        </div>
                        <span className="text-xs text-emerald-500 font-semibold">+0%</span>
                    </div>
                    <h3 className="text-3xl font-bold text-foreground">Rs {stats.totalRevenue}</h3>
                    <p className="text-sm text-muted-foreground mt-1">Total Revenue</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visits Trend */}
                <div className="bg-card rounded-md p-8 shadow-sm border border-border premium-card">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-foreground">Visits Trend</h3>
                        <select className="px-4 py-2 border border-border rounded-md text-sm">
                            <option>Last 7 Days</option>
                            <option>Last 30 Days</option>
                            <option>Last 90 Days</option>
                        </select>
                    </div>
                    
                    {/* Line Chart Placeholder */}
                    <div className="h-64 flex items-end justify-between gap-2">
                        {[0, 0, 0, 0, 0, 0, 0].map((height, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-2">
                                <div className="w-full bg-primary/20 rounded-t-lg transition-all hover:bg-primary/30" style={{ height: '20px' }}></div>
                                <span className="text-xs text-muted-foreground">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-card rounded-md p-8 shadow-sm border border-border premium-card">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-foreground">Revenue Breakdown</h3>
                        <select className="px-4 py-2 border border-border rounded-md text-sm">
                            <option>This Month</option>
                            <option>Last Month</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    
                    {/* Donut Chart Placeholder */}
                    <div className="flex items-center justify-center h-64">
                        <div className="relative w-48 h-48">
                            <div className="absolute inset-0 rounded-md border-[40px] border-border"></div>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <p className="text-3xl font-bold text-foreground">{stats.totalEnrollments}</p>
                                <p className="text-sm text-muted-foreground">Total</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-md bg-blue-500"></div>
                                <span className="text-sm text-muted-foreground">Course Sales</span>
                            </div>
                            <span className="text-sm font-semibold text-foreground">Rs {stats.totalRevenue}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-md bg-green-500"></div>
                                <span className="text-sm text-muted-foreground">Subscriptions</span>
                            </div>
                            <span className="text-sm font-semibold text-foreground">Rs 3000</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-md bg-orange-500"></div>
                                <span className="text-sm text-muted-foreground">Other</span>
                            </div>
                            <span className="text-sm font-semibold text-foreground">Rs 2000</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Stats Table */}
            <div className="bg-card rounded-md p-8 shadow-sm border border-border premium-card">
                <h3 className="text-xl font-bold text-foreground mb-6">Course Performance</h3>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-border">
                                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Course Name</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Enrollments</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Completion Rate</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Revenue</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-muted-foreground">Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-50">
                                <td colSpan="5" className="text-center py-12 text-muted-foreground">
                                    No course data available
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Student Engagement */}
            <div className="bg-card rounded-md p-8 shadow-sm border border-border premium-card">
                <h3 className="text-xl font-bold text-foreground mb-6">Student Engagement</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-muted rounded-md">
                        <div className="text-4xl mb-2 text-primary flex justify-center">
                            <Icon icon="solar:graph-bold" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">0%</p>
                        <p className="text-sm text-muted-foreground mt-1">Active Students</p>
                    </div>
                    <div className="text-center p-6 bg-muted rounded-md">
                        <div className="text-4xl mb-2 text-primary flex justify-center">
                            <Icon icon="solar:clock-circle-bold" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">0h</p>
                        <p className="text-sm text-muted-foreground mt-1">Avg. Study Time</p>
                    </div>
                    <div className="text-center p-6 bg-muted rounded-md">
                        <div className="text-4xl mb-2 text-primary flex justify-center">
                            <Icon icon="solar:check-circle-bold" />
                        </div>
                        <p className="text-3xl font-bold text-foreground">0%</p>
                        <p className="text-sm text-muted-foreground mt-1">Completion Rate</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
