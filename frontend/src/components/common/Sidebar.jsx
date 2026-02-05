import { Icon } from '@iconify/react';
import { AnimatePresence, motion } from 'motion/react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import logo from '../../assets/logoo.png';


const Sidebar = ({ menuItems, role = 'student', extraContent }) => {
  const navigate = useNavigate();

  
  // State: isCollapsed (manual toggle)
  const [isCollapsed, setIsCollapsed] = useState(false);



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
      className="h-screen bg-card border-r border-border flex flex-col p-4 shadow-sm shrink-0 overflow-hidden text-muted-foreground"
    >
      {/* Brand & Toggle */}
      <div className="flex items-center justify-between mb-10 overflow-visible h-8 relative">
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
              <span className="text-2xl font-bold tracking-tight text-primary">
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

        <div className="group relative">
          <button 
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors hidden md:block cursor-pointer"
          >
            <Icon icon="solar:sidebar-minimalistic-outline" size={20} />
          </button>
          
          {/* Tooltip */}
          <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 rounded bg-popover text-popover-foreground text-xs invisible group-hover:visible whitespace-nowrap z-50 shadow-md border border-border">
            {isCollapsed ? 'Open sidebar' : 'Close sidebar'}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-x-hidden">
        <p className="text-[10px] font-bold mb-4 uppercase tracking-wider whitespace-nowrap overflow-hidden text-muted-foreground/60">
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
                  ? 'bg-muted text-foreground font-bold border-l-4 border-primary'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
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
                  <div className={`absolute left-full ml-4 px-2 py-1 rounded bg-popover text-popover-foreground text-xs invisible group-hover:visible whitespace-nowrap z-50 pointer-events-none shadow-md border border-border`}>
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


    </motion.div>
  );
};

export default Sidebar;
