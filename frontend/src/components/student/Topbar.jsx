
const StudentTopbar = () => {
  return (
    <div className="flex justify-between items-center py-4 mb-8">
        
        {/* Search Bar */}
        <div className="flex-1 max-w-xl">
            <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">🔍</span>
                <input 
                    type="text" 
                    placeholder="Search your course..." 
                    className="w-full pl-12 pr-4 py-3 bg-white border border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-sm outline-none transition-all shadow-sm text-gray-900 placeholder-gray-400"
                />
            </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-6">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:shadow-md transition-all shadow-sm">
                ✉️
            </button>
             <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 hover:text-primary hover:shadow-md transition-all shadow-sm relative">
                🔔
                <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
            </button>
            
            <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
                <div className="w-10 h-10 rounded-full bg-blue-100 overflow-hidden border-2 border-white shadow-sm">
                     <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Prashiksha" alt="User" />
                </div>
                 <div className="hidden md:block text-right">
                    <p className="text-sm font-bold text-gray-900">Prashiksha Shrestha</p>
                 </div>
            </div>
        </div>
    </div>
  );
};

export default StudentTopbar;
