import { NavLink } from 'react-router-dom';

const StudentSidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: 'HH', path: '/student/dashboard' },
    { name: 'My Enrollments', icon: '🎓', path: '/student/my-enrollments' },
    { name: 'Inbox', icon: '✉️', path: '/inbox' },
    { name: 'Lesson', icon: '📖', path: '/lessons' },
    { name: 'Task', icon: '📝', path: '/tasks' },
    { name: 'Group', icon: '👥', path: '/groups' },
  ];

  const friends = [
    { name: 'Bagas Mahpie', status: 'Friend', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bagas' },
    { name: 'Sir Dandy', status: 'Old Friend', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dandy' },
    { name: 'Jhon Tosan', status: 'Friend', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jhon' },
  ];

  return (
    <div className="w-64 bg-white min-h-screen border-r border-gray-100 flex flex-col p-6 hidden md:flex font-outfit">

      {/* Brand */}
      <div className="flex items-center gap-3 mb-10 text-gray-900">
        <span className="text-2xl font-bold text-primary tracking-tight">NEX-L</span>
      </div>

      {/* Overview Menu */}
      <div className="mb-8">
        <p className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Overview</p>
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive
                  ? 'bg-gray-50 text-gray-900 font-bold border-l-4 border-primary'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`
              }
            >
              <span className="text-lg w-5">{item.icon === 'HH' ? '::' : item.icon}</span> {/* Dashboard Icon Placeholder */}
              <span className="font-medium">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Friends Section */}
      <div className="mb-8">
        <p className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Friends</p>
        <div className="space-y-4">
          {friends.map((friend, idx) => (
            <div key={idx} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-xl transition-colors">
              <img src={friend.avatar} alt={friend.name} className="w-8 h-8 rounded-full bg-gray-100" />
              <div>
                <p className="text-sm font-bold text-gray-900">{friend.name}</p>
                <p className="text-xs text-gray-500">{friend.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Settings */}
      <div className="mt-auto pt-6 border-t border-gray-100">
        <p className="text-xs font-bold text-gray-400 mb-4 uppercase tracking-wider">Settings</p>
        <nav className="space-y-2">
          <button className="flex items-center gap-3 px-4 py-2 w-full text-gray-500 hover:text-gray-900 rounded-xl hover:bg-gray-50 transition-colors">
            <span>⚙️</span>
            <span className="font-medium">Setting</span>
          </button>
          <button className="flex items-center gap-3 px-4 py-2 w-full text-red-500 hover:bg-red-50 rounded-xl transition-colors">
            <span>🚪</span>
            <span className="font-medium">Logout</span>
          </button>
        </nav>
      </div>

    </div>
  );
};

export default StudentSidebar;
