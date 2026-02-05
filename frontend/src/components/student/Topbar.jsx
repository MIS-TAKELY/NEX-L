import { Icon } from '@iconify/react';
import { useContext } from 'react';
import { AppContext } from '../../context/AppContext';
import ProfileDropdown from '../common/ProfileDropdown';

const StudentTopbar = () => {
  const { userData } = useContext(AppContext);
  const displayName = userData?.name || 'Student';

  return (
    <div className="flex justify-between items-center py-4 mb-8">
        
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Icon icon="solar:magnifer-linear" size={18} />
                </span>
                <input 
                    type="text" 
                    placeholder="Search your course..." 
                    className="w-full pl-12 pr-4 py-3 bg-card border border-border focus:border-primary/20 focus:bg-card rounded-2xl text-sm outline-none transition-all shadow-sm text-foreground placeholder:text-muted-foreground"
                />
            </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
            <button className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-md transition-all shadow-sm border border-border">
                <Icon icon="solar:letter-linear" size={20} />
            </button>
            <button onClick={() => window.location.href = '/cart'} className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-md transition-all shadow-sm border border-border">
                <Icon icon="solar:cart-large-2-linear" size={20} />
            </button>
             <button className="w-10 h-10 bg-card rounded-full flex items-center justify-center text-muted-foreground hover:text-primary hover:shadow-md transition-all shadow-sm relative border border-border">
                <Icon icon="solar:bell-linear" size={20} />
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-background"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-border">
                <ProfileDropdown />
            </div>
        </div>
    </div>
  );
};

export default StudentTopbar;
