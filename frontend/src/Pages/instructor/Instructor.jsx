import { NavLink, Outlet, useNavigate } from "react-router-dom";

const Instructor = () => {
    const navigate = useNavigate();

    const menuItems = [
        { name: "Rate", path: "/instructor/rate", icon: "📊" }, // Placeholder Icon
        { name: "Overview", path: "/instructor/dashboard", icon: "⭐" },
        { name: "Reports", path: "/instructor/reports", icon: "📄" },
        { name: "Settings", path: "/instructor/settings", icon: "⚙️" },
    ];

    // Placeholder for top nav items from the image
    const topNavItems = ["Dashboard", "Insights", "Channels"];

    return (
        <div className="flex min-h-screen bg-[#F0F4F8] font-outfit">
            {/* Sidebar - Dark Theme based on 'Circle' UI */}
            <div className="w-24 md:w-72 bg-[#546b82] text-white flex flex-col transition-all duration-300">
                {/* Logo Area */}
                <div className="p-8 flex items-center gap-3">
                     <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                        <div className="w-4 h-4 bg-white rounded-full"></div>
                     </div>
                     <span className="text-2xl font-bold hidden md:block tracking-wide">Circle</span>
                </div>

                {/* Main Navigation */}
                <nav className="flex-1 mt-6 px-4 space-y-4">
                    {/* Active item typically has a white circle indicator in the mock, simplified here with bg */}
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `flex items-center gap-4 px-4 py-3 rounded-xl transition-all duration-200 group ${
                                    isActive 
                                    ? "bg-white/10 text-white shadow-lg backdrop-blur-sm" 
                                    : "text-blue-100/70 hover:bg-white/5 hover:text-white"
                                }`
                            }
                        >
                            <span className="text-xl p-2 bg-white/5 rounded-lg group-hover:bg-white/20 transition-colors">{item.icon}</span>
                            <span className="hidden md:block font-medium">{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                {/* Bottom User/Profile Section */}
                <div className="p-6 border-t border-white/10 mt-auto">
                    <button onClick={() => navigate('/')} className="flex items-center gap-3 w-full p-2 hover:bg-white/5 rounded-lg transition-colors text-left text-blue-100/80 hover:text-white">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-pink-400 to-orange-400 overflow-hidden">
                             {/* Placeholder Avatar */}
                             <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                        </div>
                        <div className="hidden md:block">
                             <p className="text-sm font-bold">Admin User</p>
                             <p className="text-xs opacity-70">View Profile</p>
                        </div>
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Navbar */}
                <header className="bg-[#546b82] text-white py-4 px-8 flex justify-between items-center shadow-sm z-10 shrink-0">
                    <div className="flex items-center gap-4">
                         <button onClick={() => navigate(-1)} className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-2 text-sm font-medium">
                            <span className="bg-white text-[#546b82] rounded-full w-6 h-6 flex items-center justify-center text-xs">‹</span>
                            Back
                         </button>
                    </div>

                    <div className="flex items-center gap-8 text-sm font-medium tracking-wide">
                        {topNavItems.map((item) => (
                            <div key={item} className={`cursor-pointer pb-1 ${item === 'Dashboard' ? 'border-b-2 border-white' : 'opacity-70 hover:opacity-100'}`}>
                                {item.toUpperCase()}
                            </div>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex -space-x-2">
                             {[1,2,3].map(i => (
                                 <div key={i} className="w-8 h-8 rounded-full border-2 border-[#546b82] bg-gray-200 overflow-hidden">
                                     <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`} alt="Member" />
                                 </div>
                             ))}
                        </div>
                        <span className="text-xs opacity-80">12 members</span>
                    </div>
                </header>

                {/* Dashboard Content Container */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-[#546b82]"> 
                     {/* Note: The mock shows the 'page' content is actually on a white card-like container ON TOP of the blue background. 
                         So we wrapper Outlet in a big white container. */}
                    <div className="bg-[#F0F4F8] rounded-[2.5rem] min-h-full p-8 shadow-2xl overflow-y-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Instructor;
