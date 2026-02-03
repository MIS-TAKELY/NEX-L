
const Statistics = () => {
    return (
        <div className="space-y-8 font-outfit">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Full Statistics</h1>
                    <p className="text-gray-500 mt-1">Comprehensive analytics and performance metrics</p>
                </div>
                <button className="px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:bg-primary/90 transition-colors">
                    Export Report
                </button>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600">
                            <Icon icon="solar:eye-bold" className="text-2xl" />
                        </div>
                        <span className="text-xs text-green-500 font-semibold">+0%</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">0</h3>
                    <p className="text-sm text-gray-500 mt-1">Total Visits</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-600">
                            <Icon icon="solar:notebook-bold" className="text-2xl" />
                        </div>
                        <span className="text-xs text-green-500 font-semibold">+0%</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">0</h3>
                    <p className="text-sm text-gray-500 mt-1">Course Enrollments</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                            <Icon icon="solar:star-bold" className="text-2xl" />
                        </div>
                        <span className="text-xs text-gray-500 font-semibold">0</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">0</h3>
                    <p className="text-sm text-gray-500 mt-1">Average Rating</p>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                            <Icon icon="solar:wad-of-money-bold" className="text-2xl" />
                        </div>
                        <span className="text-xs text-green-500 font-semibold">+0%</span>
                    </div>
                    <h3 className="text-3xl font-bold text-gray-900">Rs 0</h3>
                    <p className="text-sm text-gray-500 mt-1">Total Revenue</p>
                </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Visits Trend */}
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Visits Trend</h3>
                        <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
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
                                <span className="text-xs text-gray-400">
                                    {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Revenue Breakdown */}
                <div className="bg-white rounded-2xl p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900">Revenue Breakdown</h3>
                        <select className="px-4 py-2 border border-gray-200 rounded-lg text-sm">
                            <option>This Month</option>
                            <option>Last Month</option>
                            <option>This Year</option>
                        </select>
                    </div>
                    
                    {/* Donut Chart Placeholder */}
                    <div className="flex items-center justify-center h-64">
                        <div className="relative w-48 h-48">
                            <div className="absolute inset-0 rounded-full border-[40px] border-gray-100"></div>
                            <div className="absolute inset-0 flex items-center justify-center flex-col">
                                <p className="text-3xl font-bold text-gray-900">Rs 0</p>
                                <p className="text-sm text-gray-500">Total</p>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                                <span className="text-sm text-gray-600">Course Sales</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">Rs 0</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                                <span className="text-sm text-gray-600">Subscriptions</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">Rs 0</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                                <span className="text-sm text-gray-600">Other</span>
                            </div>
                            <span className="text-sm font-semibold text-gray-900">Rs 0</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Detailed Stats Table */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Course Performance</h3>
                
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100">
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Course Name</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Enrollments</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Completion Rate</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Revenue</th>
                                <th className="text-left py-4 px-4 text-sm font-semibold text-gray-600">Rating</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-b border-gray-50">
                                <td colSpan="5" className="text-center py-12 text-gray-400">
                                    No course data available
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Student Engagement */}
            <div className="bg-white rounded-2xl p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Student Engagement</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center p-6 bg-gray-50 rounded-xl">
                        <div className="text-4xl mb-2 text-primary flex justify-center">
                            <Icon icon="solar:graph-bold" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">0%</p>
                        <p className="text-sm text-gray-500 mt-1">Active Students</p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-xl">
                        <div className="text-4xl mb-2 text-primary flex justify-center">
                            <Icon icon="solar:clock-circle-bold" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">0h</p>
                        <p className="text-sm text-gray-500 mt-1">Avg. Study Time</p>
                    </div>
                    <div className="text-center p-6 bg-gray-50 rounded-xl">
                        <div className="text-4xl mb-2 text-primary flex justify-center">
                            <Icon icon="solar:check-circle-bold" />
                        </div>
                        <p className="text-3xl font-bold text-gray-900">0%</p>
                        <p className="text-sm text-gray-500 mt-1">Completion Rate</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Statistics;
