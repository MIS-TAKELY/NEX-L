import { Icon } from '@iconify/react';

const AdminTopbar = () => {
  return (
    <div className="h-20 bg-white border-b border-gray-100 flex items-center justify-between px-8 sticky top-0 z-10">
      <div className="flex-1 max-w-md">
        <div className="relative">
          <Icon icon="solar:magnifer-linear" className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search resources..." 
            className="w-full pl-12 pr-4 py-2.5 bg-gray-50 border border-transparent focus:border-primary/20 focus:bg-white rounded-xl text-sm outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-6">
        <button className="relative w-10 h-10 flex items-center justify-center text-gray-500 hover:bg-gray-50 rounded-full transition-colors">
          <Icon icon="solar:bell-linear" size={20} />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        
        <div className="flex items-center gap-3 pl-6 border-l border-gray-100">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-gray-900">Admin User</p>
            <p className="text-xs text-gray-500">Super Admin</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center text-white overflow-hidden shadow-md">
            <Icon icon="solar:user-circle-bold-duotone" size={24} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminTopbar;
