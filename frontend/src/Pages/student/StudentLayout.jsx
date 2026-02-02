import { Icon } from '@iconify/react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar';

import StudentTopbar from '../../components/student/Topbar';

const StudentLayout = () => {
  const menuItems = [
    { name: 'Dashboard', icon: "solar:widget-2-linear", path: '/student/dashboard' },
    { name: 'Inbox', icon: "solar:letter-linear", path: '/student/inbox' },
    { name: 'Lesson', icon: "solar:notebook-linear", path: '/student/lessons' },
    { name: 'Task', icon: "solar:clipboard-check-linear", path: '/student/tasks' },
    { name: 'Group', icon: "solar:users-group-rounded-linear", path: '/student/groups' },
  ];

  const friends = [
    { name: 'Bagas Mahpie', status: 'Friend' },
    { name: 'Sir Dandy', status: 'Old Friend' },
    { name: 'Jhon Tosan', status: 'Friend' },
  ];

  const extraContent = (
    <div className="space-y-4">
      <p className="text-[10px] font-bold text-gray-400 mb-4 uppercase tracking-wider">Friends</p>
      {friends.map((friend, idx) => (
        <div key={idx} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
            <Icon icon="solar:user-circle-linear" size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 leading-tight">{friend.name}</p>
            <p className="text-[10px] text-gray-500">{friend.status}</p>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-gray-50 font-outfit text-gray-800 overflow-hidden">
      {/* Universal Sidebar */}
      <Sidebar 
        menuItems={menuItems} 
        role="student" 
        extraContent={extraContent} 
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
