import { useContext } from "react";
import { Outlet } from "react-router-dom";
import ProfileDropdown from "../../components/common/ProfileDropdown";
import Sidebar from "../../components/common/Sidebar";
import { AppContext } from "../../context/AppContext";

const Instructor = () => {
  const { userData } = useContext(AppContext);
  const displayName = userData?.name || "Instructor";

  const menuItems = [
    {
      name: "Dashboard",
      icon: "solar:widget-2-linear",
      path: "/instructor/dashboard",
    },
    {
      name: "My Courses",
      icon: "solar:notebook-linear",
      path: "/instructor/courses",
    },
    {
      name: "Add Course",
      icon: "solar:add-circle-linear",
      path: "/instructor/add-course",
    },
    {
      name: "Analytics",
      icon: "solar:graph-up-linear",
      path: "/instructor/analytics",
    },
    {
      name: "Messages",
      icon: "solar:chat-round-dots-linear",
      path: "/instructor/messages",
    },
  ];
// 
  const extraContent = (
    <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-4">
      <p className="text-[10px] font-bold text-muted-foreground/60 mb-3 uppercase tracking-wider">
        Quick Stats
      </p>
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Total Courses</span>
          <span className="text-lg font-bold text-primary">0</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Students</span>
          <span className="text-lg font-bold text-primary">0</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background font-outfit text-foreground overflow-hidden">
      {/* Unified Sidebar */}
      <Sidebar
        menuItems={menuItems}
        role="instructor"
        extraContent={extraContent}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="bg-card border-b border-border py-4 px-8 flex justify-between items-center shadow-sm z-10 shrink-0">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">
              Instructor Portal
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <ProfileDropdown />
            <div className="hidden md:block">
              <p className="text-xs text-muted-foreground">Instructor</p>
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
