import { Outlet } from 'react-router-dom';
import AdminTopbar from '../../components/admin/Topbar';
import Sidebar from '../../components/common/Sidebar';

const AdminLayout = () => {
  const menuItems = [
    { name: 'Dashboard', icon: "solar:widget-2-linear", path: '/admin/dashboard' },
    { name: 'Users', icon: "solar:users-group-rounded-linear", path: '/admin/users' },
    { name: 'Courses', icon: "solar:notebook-linear", path: '/admin/courses' },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-outfit overflow-hidden">
      {/* Universal Sidebar */}
      <Sidebar 
        menuItems={menuItems} 
        role="admin" 
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <AdminTopbar />
        <main className="flex-1 p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
