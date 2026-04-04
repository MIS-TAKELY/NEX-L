import { NavLink } from 'react-router-dom';
import { Icon } from '@iconify/react';
import logo from '../../assets/logoo.png';

const StudentSidebar = () => {
  const menuItems = [
    { name: 'Dashboard', icon: 'solar:widget-3-bold-duotone', path: '/student/dashboard' },
    { name: 'My Enrollments', icon: 'solar:notebook-bold-duotone', path: '/student/my-enrollments' },
    { name: 'Inbox', icon: 'solar:letter-bold-duotone', path: '/inbox' },
    { name: 'Lesson', icon: 'solar:book-open-bold-duotone', path: '/lessons' },
    { name: 'Task', icon: 'solar:checklist-minimalistic-bold-duotone', path: '/tasks' },
    { name: 'Group', icon: 'solar:users-group-rounded-bold-duotone', path: '/groups' },
  ];

  const friends = [
    { name: 'Bagas Mahpie', status: 'Friend', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bagas' },
    { name: 'Sir Dandy', status: 'Old Friend', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dandy' },
    { name: 'Jhon Tosan', status: 'Friend', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jhon' },
  ];

  return (
    <div className="w-72 bg-card min-h-screen border-r border-border/50 flex flex-col p-8 hidden md:flex font-outfit shadow-sm">

      {/* Brand */}
      <div className="flex items-center gap-3 mb-12 px-2">
        <div className="w-10 h-10 bg-primary/10 rounded-md flex items-center justify-center border border-primary/20">
          <img src={logo} alt="N" className="h-6 w-auto" />
        </div>
        <span className="text-2xl font-black text-foreground tracking-tighter">NEX<span className="text-primary">L</span></span>
      </div>

      {/* Overview Menu */}
      <div className="mb-10">
        <p className="px-4 text-[10px] font-black text-muted-foreground mb-4 uppercase tracking-[0.2em] opacity-60">Overview</p>
        <nav className="space-y-1.5">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3.5 px-4 py-3.5 rounded-md transition-all duration-300 group ${isActive
                  ? 'bg-primary/10 text-primary shadow-sm shadow-primary/5'
                  : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                }`
              }
            >
              <Icon icon={item.icon} className={`text-xl transition-transform duration-300 group-hover:scale-110 ${window.location.pathname === item.path ? 'text-primary' : 'text-muted-foreground group-hover:text-foreground'}`} />
              <span className="font-bold text-sm tracking-tight">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Friends Section */}
      <div className="mb-10 lg:block hidden">
        <p className="px-4 text-[10px] font-black text-muted-foreground mb-4 uppercase tracking-[0.2em] opacity-60">Connections</p>
        <div className="space-y-3">
          {friends.map((friend, idx) => (
            <div key={idx} className="flex items-center gap-3.5 cursor-pointer hover:bg-secondary/50 px-4 py-2.5 rounded-md transition-all group">
              <div className="relative">
                <img src={friend.avatar} alt={friend.name} className="w-9 h-9 rounded-md bg-secondary object-cover border border-border/50 group-hover:border-primary/30 transition-colors" />
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-md border-2 border-card" />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">{friend.name}</p>
                <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{friend.status}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Settings */}
      <div className="mt-auto pt-8 border-t border-border/50">
        <p className="px-4 text-[10px] font-black text-muted-foreground mb-4 uppercase tracking-[0.2em] opacity-60">System</p>
        <nav className="space-y-1.5">
          <NavLink to="/student/settings" className={({ isActive }) => `flex items-center gap-3.5 px-4 py-3 w-full rounded-md transition-all duration-300 group ${isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'}`}>
            <Icon icon="solar:settings-bold-duotone" className="text-xl group-hover:rotate-45 transition-transform duration-500" />
            <span className="font-bold text-sm tracking-tight">Settings</span>
          </NavLink>
          <button className="flex items-center gap-3.5 px-4 py-3 w-full text-destructive/70 hover:text-destructive hover:bg-destructive/5 rounded-md transition-all group">
            <Icon icon="solar:logout-bold-duotone" className="text-xl group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold text-sm tracking-tight">Sign Out</span>
          </button>
        </nav>
      </div>

    </div>
  );
};

export default StudentSidebar;
