import { useDispatch, useSelector } from "react-redux";
import { toggleTheme } from "@/store/slices/uiSlice";
import { Icon } from "@iconify/react";
import { Outlet } from "react-router-dom";
import ProfileDropdown from "../../components/common/ProfileDropdown";
import Sidebar from "../../components/common/Sidebar";

const Instructor = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);
  const { userData } = useSelector((state) => state.auth);
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
      name: "Students",
      icon: "solar:users-group-rounded-linear",
      path: "/instructor/students-enrolled",
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
    {
      name: "Consultations",
      icon: "solar:videocamera-record-linear",
      path: "/instructor/consultations",
    },
    {
      name: "Settings",
      icon: "solar:settings-bold-duotone",
      path: "/instructor/settings",
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
        <header className="bg-background/80 backdrop-blur-md border-b border-border/50 py-4 px-8 flex justify-between items-center z-10 shrink-0 sticky top-0">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-foreground tracking-tight">
              Instructor Portal
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
                onClick={() => dispatch(toggleTheme())}
                className="w-10 h-10 bg-secondary/50 rounded-xl flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-lg hover:shadow-primary/10 transition-all border border-border/50 group"
            >
                <Icon
                    icon="solar:sun-bold-duotone"
                    className={`absolute h-5 w-5 transition-all duration-500 ease-in-out ${
                        theme === 'dark' ? 'scale-0 -rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100'
                    } text-amber-500`}
                />
                <Icon
                    icon="solar:moon-stars-bold-duotone"
                    className={`absolute h-5 w-5 transition-all duration-500 ease-in-out ${
                        theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-0 rotate-90 opacity-0'
                    } text-blue-400`}
                />
            </button>
            <div className="h-6 w-[1px] bg-border/50 mx-2" />
            <div className="flex items-center gap-3">
              <div className="hidden md:block text-right">
                <p className="text-sm font-semibold text-foreground leading-none">{displayName}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Instructor</p>
              </div>
              <ProfileDropdown />
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
