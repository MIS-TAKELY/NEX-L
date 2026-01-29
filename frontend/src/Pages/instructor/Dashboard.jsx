
const Dashboard = () => {
    return (
        <div className="space-y-8 font-outfit">
            
            {/* Top Stats Section - Mix of Large Card and Smaller Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Visits Card - Large Gradient Card */}
                <div className="lg:col-span-2 bg-gradient-to-br from-[#4b8fb1] to-[#d8b08c] rounded-[2.5rem] p-8 text-white relative overflow-hidden min-h-[300px] flex flex-col justify-center">
                    <div className="relative z-10 w-full md:w-1/2">
                        <p className="text-blue-100 text-sm font-medium mb-1">Visits for today</p>
                        <h2 className="text-7xl font-bold mb-6">824</h2>
                        
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="p-1 rounded bg-white/20">⭐</span>
                                <div>
                                    <p className="text-xs text-blue-100">Popularity</p>
                                    <p className="font-bold">93</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="p-1 rounded bg-white/20">📈</span>
                                <div>
                                    <p className="text-xs text-blue-100">General rate</p>
                                    <p className="font-bold">4.7</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button className="absolute bottom-0 right-0 bg-[#2b5a7a] text-white px-8 py-4 rounded-tl-[2.5rem] font-bold text-sm tracking-wide hover:bg-[#20455e] transition-colors flex items-center gap-2">
                        VIEW FULL STATISTIC ›
                    </button>

                    {/* Illustration Placeholder */}
                    <div className="absolute top-8 right-8 w-1/2 h-full pointer-events-none hidden md:block">
                         {/* Circle/Character Illustration placeholder */}
                         <div className="w-full h-full bg-contain bg-no-repeat bg-center opacity-90" style={{ backgroundImage: 'url("https://cdn3d.iconscout.com/3d/premium/thumb/man-working-on-laptop-2996954-2492508.png")' }}></div>
                    </div>
                </div>

                {/* Popularity Rate Card */}
                <div className="bg-[#fcdbc7] rounded-[2.5rem] p-8 relative flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-start">
                             <p className="font-bold text-gray-800">Popularity rate</p>
                             <span className="bg-white px-2 py-1 rounded-full text-xs font-bold shadow-sm">+2</span>
                        </div>
                        <h2 className="text-6xl font-bold text-gray-900 mt-2">87<span className="text-2xl align-top text-gray-500">°</span></h2>
                    </div>

                    {/* Gauge Chart Placeholder */}
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 w-24 h-24 border-8 border-white rounded-full border-t-transparent border-l-transparent rotate-45 opacity-50"></div>

                    <div className="mt-8">
                        <p className="text-xs text-gray-600 leading-relaxed mb-4">
                            Your Rate has increased because of your recent update activity. <span className="font-bold">Keep moving</span> forward and get more points!
                        </p>
                        <div className="bg-white p-3 rounded-xl flex items-center justify-between shadow-sm cursor-pointer hover:shadow-md transition-shadow">
                             <div className="flex items-center gap-3">
                                 <span className="text-orange-400">✈️</span>
                                 <div className="text-xs text-gray-500 leading-tight">
                                     Learn insights how to manage all <br/> aspects of your startup
                                 </div>
                             </div>
                             <div className="w-8 h-8 rounded-full bg-orange-400 flex items-center justify-center text-white">▶</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Finance Performance */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-gray-800">Finance Performance</h3>
                    </div>
                    
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                             <div className="w-10 h-10 rounded-xl bg-[#2b5a7a] flex items-center justify-center text-white font-bold">$</div>
                             <div>
                                 <h4 className="text-2xl font-bold text-gray-800">12 841</h4>
                                 <p className="text-xs text-gray-400">Monthly income</p>
                             </div>
                        </div>
                        <button className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">📅</button>
                    </div>

                    {/* Bar Chart Placeholder */}
                    <div className="flex justify-between items-end h-32 px-2">
                        {[40, 60, 30, 80, 50, 90].map((height, i) => (
                            <div key={i} className="group flex flex-col items-center gap-2 w-full">
                                <div className={`w-2 rounded-full transition-all duration-300 group-hover:w-3 ${i === 5 ? 'bg-[#2b5a7a]' : 'bg-gray-200'}`} style={{ height: `${height}%` }}></div>
                                <span className="text-[10px] text-gray-400">{['DEC', 'JAN', 'FEB', 'MAR', 'APR', 'MAY'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Performers */}
                <div className="bg-white rounded-[2.5rem] p-8 shadow-sm">
                    <h3 className="font-bold text-gray-800 mb-6">TOP performers</h3>
                    
                    <div className="space-y-6">
                        {[
                            { name: "Bessie Cooper", status: "Online", score: "4.3", seed: "Bessie" },
                            { name: "Albert Flores", status: "Online", score: "4.7", seed: "Albert" },
                            { name: "Guy Hawkins", status: "2 minutes ago", score: "4.4", seed: "Guy" },
                        ].map((user, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.seed}`} alt={user.name} />
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
                 <div className="bg-white rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-gray-800">Targeting by region</h3>
                    </div>
                    
                    {/* Map Placeholder */}
                    <div className="w-full h-40 bg-gray-50 rounded-xl relative opacity-50 mt-4" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '10px 10px' }}>
                        {/* Dot markers */}
                        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-[#2b5a7a]/20 rounded-full flex items-center justify-center animate-pulse">
                            <div className="w-1.5 h-1.5 bg-[#2b5a7a] rounded-full"></div>
                        </div>
                        <div className="absolute bottom-1/3 right-1/3 w-3 h-3 bg-[#2b5a7a]/20 rounded-full flex items-center justify-center animate-pulse animation-delay-500">
                             <div className="w-1.5 h-1.5 bg-[#2b5a7a] rounded-full"></div>
                        </div>

                         {/* Tooltip Card */}
                         <div className="absolute top-4 right-8 bg-white p-2 rounded-lg shadow-lg flex items-center gap-2 border border-gray-100 animate-bounce">
                             <div className="w-6 h-6 rounded bg-gray-200 overflow-hidden">
                                 {/* Flag placeholder */}
                                 <img src="https://flagcdn.com/w40/pl.png" alt="Poland" className="w-full h-full object-cover" />
                             </div>
                             <div>
                                 <p className="text-xs font-bold">Poland</p>
                                 <p className="text-[10px] text-green-500">23.03% ▲ 4.7</p>
                             </div>
                         </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
