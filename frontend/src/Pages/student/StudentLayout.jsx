import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';

import StudentTopbar from '../../components/student/Topbar';

const StudentLayout = () => {
  const menuItems = [
    { name: 'Dashboard', icon: "solar:widget-2-linear", path: '/student/dashboard' },
    { name: 'Enrolled Courses', icon: "solar:notebook-linear", path: '/student/my-enrollments' },
    { name: 'My Badges', icon: "solar:medal-ribbons-star-bold", path: '/student/badges' },
    { name: 'Consultations', icon: "solar:calendar-mark-linear", path: '/student/consultations' },
    { name: 'Cart', icon: "solar:cart-linear", path: '/student/cart' },
    { name: 'Settings', icon: "solar:settings-linear", path: '/student/settings' },
  ];

  return (
    <div className="flex min-h-screen bg-background font-outfit text-foreground overflow-hidden">
      {/* Universal Sidebar */}
      <Sidebar
        menuItems={menuItems}
        role="student"
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="px-4 md:px-8">
          <StudentTopbar />
        </div>
        <main className="flex-1 overflow-y-auto p-4 md:p-8 pt-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default StudentLayout;
