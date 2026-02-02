import { Icon } from "@iconify/react";
import { useContext } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/common/Sidebar";
import { AppContext } from "../../context/AppContext";

const Instructor = () => {
    const { userData } = useContext(AppContext);
    const displayName = userData 
        ? `${userData.firstName} ${userData.lastName}` 
        : 'Instructor';

    const menuItems = [
        { name: 'Dashboard', icon: "solar:widget-2-linear", path: '/instructor/dashboard' },
        { name: 'My Courses', icon: "solar:notebook-linear", path: '/instructor/courses' },
        { name: 'Add Course', icon: "solar:add-circle-linear", path: '/instructor/add-course' },
        { name: 'Analytics', icon: "solar:graph-up-linear", path: '/instructor/analytics' },
        { name: 'Messages', icon: "solar:chat-round-dots-linear", path: '/instructor/messages' },
    ];

    const extraContent = (
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4">
            <p className="text-[10px] font-bold text-gray-400 mb-3 uppercase tracking-wider">Quick Stats</p>
            <div className="space-y-2">
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Total Courses</span>
                    <span className="text-lg font-bold text-primary">0</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Students</span>
                    <span className="text-lg font-bold text-primary">0</span>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex min-h-screen bg-gray-50 font-outfit overflow-hidden">
            {/* Unified Sidebar */}
            <Sidebar 
                menuItems={menuItems} 
                role="instructor" 
                extraContent={extraContent} 
            />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-100 py-4 px-8 flex justify-between items-center shadow-sm z-10 shrink-0">
                    <div className="flex items-center gap-4">
                        <h1 className="text-2xl font-bold text-gray-900">Instructor Portal</h1>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 px-4 py-2 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white overflow-hidden shadow-md">
                                <Icon icon="solar:user-circle-bold-duotone" size={24} />
                            </div>
                            <div className="hidden md:block">
                                <p className="text-sm font-bold text-gray-900">{displayName}</p>
                                <p className="text-xs text-gray-500">Instructor</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard Content Container */}
                <main className="flex-1 overflow-y-auto p-4 md:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Instructor;
