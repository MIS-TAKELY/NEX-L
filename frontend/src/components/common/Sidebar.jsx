import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'motion/react';
import { useContext, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/logoo.png';
import { AppContext } from '../../context/AppContext';

const Sidebar = ({ menuItems, role = 'student', extraContent }) => {
  const navigate = useNavigate();
  const { logout } = useContext(AppContext);
  
  // State: isCollapsed (manual toggle)
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine actual expanded state
  // It's expanded if not manually collapsed
  const isExpanded = !isCollapsed;

  const sidebarVariants = {
    expanded: { width: '256px' }, // w-64
    collapsed: { width: '80px' },  // w-20
  };

  return (
    <motion.div
      initial={false}
      animate={isExpanded ? 'expanded' : 'collapsed'}
      variants={sidebarVariants}
      className={`h-screen bg-white border-r border-gray-100 flex flex-col p-4 shadow-sm shrink-0 overflow-hidden
        ${role === 'admin' ? 'bg-zinc-900 border-zinc-800 text-zinc-400' : 'bg-white text-gray-500'}`}
    >
      {/* Brand & Toggle */}
      <div className="flex items-center justify-between mb-10 overflow-hidden h-8">
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="flex items-center gap-1 whitespace-nowrap cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            >
              <img src={logo} alt="NEXL" className="h-6 w-auto" />
              <span className={`text-2xl font-bold tracking-tight ${role === 'admin' ? 'text-white' : 'text-primary'}`}>
                EXL
              </span>
             
            </motion.div>
          )}
        </AnimatePresence>
        
        {!isExpanded && (
            <img 
              src={logo} 
              alt="N" 
              className="h-6 w-auto mx-auto cursor-pointer hover:opacity-80 transition-opacity" 
              onClick={() => navigate('/')}
            />
        )}

        <button 
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={`p-1.5 rounded-lg border transition-colors hidden md:block
            ${role === 'admin' ? 'border-zinc-800 bg-zinc-800 text-zinc-400 hover:text-white' : 'border-gray-100 bg-gray-50 text-gray-400 hover:text-primary'}`}
        >
          <Icon icon={isCollapsed ? "solar:alt-arrow-right-linear" : "solar:alt-arrow-left-linear"} size={18} />
        </button>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-x-hidden">
        <p className={`text-[10px] font-bold mb-4 uppercase tracking-wider whitespace-nowrap overflow-hidden
          ${role === 'admin' ? 'text-zinc-600' : 'text-gray-400'}`}>
          {isExpanded ? (role === 'admin' ? 'Admin Panel' : role === 'instructor' ? 'Instructor Panel' : 'Overview') : '•••'}
        </p>
        
        <nav className="space-y-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 group relative
                ${isActive
                  ? (role === 'admin' ? 'bg-primary/10 text-primary font-bold border-l-4 border-primary' : 'bg-gray-50 text-gray-900 font-bold border-l-4 border-primary')
                  : (role === 'admin' ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900')
                }`
              }
            >
              <span className="text-lg min-w-[24px] flex justify-center">
                {typeof item.icon === 'string' ? 
                  (item.icon === 'HH' ? '::' : <Icon icon={item.icon} />) : 
                  item.icon
                }
              </span>
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    className="font-medium whitespace-nowrap"
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
              
              {/* Tooltip for collapsed mode */}
              {!isExpanded && (
                  <div className={`absolute left-full ml-4 px-2 py-1 rounded bg-gray-900 text-white text-xs invisible group-hover:visible whitespace-nowrap z-50 pointer-events-none`}>
                      {item.name}
                  </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Extra Content (Friends/Stats) */}
        <AnimatePresence>
          {isExpanded && extraContent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="mt-8"
            >
              {extraContent}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Actions */}
      <div className={`mt-auto pt-6 border-t ${role === 'admin' ? 'border-zinc-800' : 'border-gray-100'}`}>
         <p className={`text-[10px] font-bold mb-4 uppercase tracking-wider whitespace-nowrap overflow-hidden
           ${role === 'admin' ? 'text-zinc-600' : 'text-gray-400'}`}>
           {isExpanded ? 'Settings' : '•••'}
         </p>
         
         <nav className="space-y-2">
            <NavLink
              to={role === 'instructor' ? "/instructor/settings" : "/settings"}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2 rounded-xl transition-all duration-200 relative group
                ${isActive
                  ? 'bg-gray-50 text-gray-900 font-bold'
                  : (role === 'admin' ? 'text-zinc-400 hover:bg-zinc-800 hover:text-white' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900')
                }`
              }
            >
                <Icon icon="solar:settings-linear" size={20} />
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-medium whitespace-nowrap"
                    >
                      Settings
                    </motion.span>
                  )}
                </AnimatePresence>
                {!isExpanded && (
                    <div className="absolute left-full ml-4 px-2 py-1 rounded bg-gray-900 text-white text-xs invisible group-hover:visible whitespace-nowrap z-50">Settings</div>
                )}
            </NavLink>
            
            <button 
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2 w-full text-red-500 hover:bg-red-50 rounded-xl transition-colors relative group"
            >
                <Icon icon="solar:logout-linear" size={20} />
                <AnimatePresence>
                  {isExpanded && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="font-medium whitespace-nowrap"
                    >
                      Logout
                    </motion.span>
                  )}
                </AnimatePresence>
                {!isExpanded && (
                    <div className="absolute left-full ml-4 px-2 py-1 rounded bg-red-600 text-white text-xs invisible group-hover:visible whitespace-nowrap z-50">Logout</div>
                )}
            </button>
         </nav>
      </div>
    </motion.div>
  );
};

export default Sidebar;
