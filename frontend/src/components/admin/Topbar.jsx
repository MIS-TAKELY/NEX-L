import { Icon } from '@iconify/react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '@/store/slices/uiSlice';

const AdminTopbar = () => {
  const dispatch = useDispatch();
  const { theme } = useSelector((state) => state.ui);

  return (
    <header className="h-20 bg-card border-b border-border flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
      <div className="flex-1 max-w-md">
        {/* Placeholder for future search bar */}
      </div>

      <div className="flex items-center gap-4">
        {/* Theme Toggle */}
        <button
          onClick={() => dispatch(toggleTheme())}
          className="w-10 h-10 bg-card rounded-md flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-md transition-all shadow-sm border border-border relative overflow-hidden group"
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
            } text-blue-400 group-hover:text-primary`}
          />
        </button>

        <div className="flex items-center gap-3 pl-6 border-l border-border">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-foreground">Admin User</p>
            <p className="text-xs text-muted-foreground">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-md bg-primary/20 flex items-center justify-center text-primary overflow-hidden border border-primary/20">
            <Icon icon="solar:user-circle-bold-duotone" size={24} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default AdminTopbar;
