import StudentSidebar from '../../components/student/Sidebar';
import StudentTopbar from '../../components/student/Topbar';

const Home = () => {
  return (
    <div className="flex min-h-screen bg-gray-50 font-outfit text-gray-800">
      
      {/* Left Sidebar */}
      <StudentSidebar />

      {/* Main Content Area */}
      <div className="flex-1 p-4 md:p-8 flex flex-col md:flex-row gap-8 overflow-y-auto">
         
         {/* Middle Column - Main Content */}
         <div className="flex-1 flex flex-col gap-8">
            <StudentTopbar />
            
            {/* Banner Section */}
            <div className="bg-primary rounded-[2rem] p-8 md:p-10 text-white relative overflow-hidden shadow-lg shadow-primary/20">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 p-10 opacity-20">
                    <div className="text-9xl">✨</div>
                </div>
                
                <div className="relative z-10 max-w-lg">
                    <p className="text-blue-100 text-xs font-bold tracking-widest uppercase mb-2">Learning Platform</p>
                    <h1 className="text-3xl md:text-4xl font-bold mb-6 leading-tight">NEXL: Elevate Your Learning</h1>
                    <button className="bg-white text-primary hover:bg-gray-100 px-8 py-3 rounded-full font-bold text-sm transition-transform active:scale-95 flex items-center gap-2">
                        Explore Courses
                        <span className="bg-primary text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">›</span>
                    </button>
                </div>
            </div>

            {/* Course Progress Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { title: "UI/UX Design", watched: "2/8", icon: "🎨" },
                    { title: "Branding", watched: "3/8", icon: "🏷️" },
                    { title: "Front End", watched: "6/12", icon: "💻" }
                ].map((course, i) => (
                    <div key={i} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-gray-100 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="flex items-center gap-3">
                             <div className={`w-10 h-10 rounded-xl bg-primary/5 text-primary flex items-center justify-center text-xl`}>{course.icon}</div>
                             <div>
                                 <p className="text-xs text-gray-400 font-medium mb-1">{course.watched} watched</p>
                                 <p className="font-bold text-gray-900 group-hover:text-primary transition-colors">{course.title}</p>
                             </div>
                        </div>
                        <button className="text-gray-300 group-hover:text-gray-900">⋮</button>
                    </div>
                ))}
            </div>

             {/* Continue Watching Section */}
             <div>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Continue Watching</h2> 
                    <div className="flex gap-2">
                        <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 hover:bg-gray-50">‹</button>
                        <button className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/30">›</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Course Card 1 */}
                   <div className="bg-white p-4 rounded-3xl border border-gray-100 hover:shadow-xl transition-all group">
                       <div className="h-40 bg-gray-200 rounded-2xl mb-4 relative overflow-hidden">
                           {/* Placeholder Image */}
                           <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1593720213428-28a5b9e94613?q=80&w=500&auto=format&fit=crop")' }}></div>
                           <div className="absolute top-3 right-3 bg-white/30 backdrop-blur-md p-2 rounded-full text-white cursor-pointer hover:bg-white/50">❤️</div>
                       </div>
                       <div>
                           <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md mb-2 inline-block">FRONT END</span>
                           <h3 className="font-bold text-gray-900 mb-4 leading-snug group-hover:text-primary transition-colors">Beginner's Guide to Becoming a Professional Front-End Developer</h3>
                           <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Leo" alt="Mentor" className="w-8 h-8 rounded-full bg-gray-100" />
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Leonardo samsul</p>
                                    <p className="text-[10px] text-gray-400">Mentor</p>
                                </div>
                           </div>
                       </div>
                   </div>

                   {/* Course Card 2 */}
                   <div className="bg-white p-4 rounded-3xl border border-gray-100 hover:shadow-xl transition-all group">
                       <div className="h-40 bg-gray-200 rounded-2xl mb-4 relative overflow-hidden">
                           <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=500&auto=format&fit=crop")' }}></div>
                           <div className="absolute top-3 right-3 bg-white/30 backdrop-blur-md p-2 rounded-full text-white cursor-pointer hover:bg-white/50">❤️</div>
                       </div>
                       <div>
                           <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-1 rounded-md mb-2 inline-block">UI/UX DESIGN</span>
                           <h3 className="font-bold text-gray-900 mb-4 leading-snug group-hover:text-primary transition-colors">Optimizing User Experience with the Best UI/UX Design</h3>
                            <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Bayu" alt="Mentor" className="w-8 h-8 rounded-full bg-gray-100" />
                                <div>
                                    <p className="text-xs font-bold text-gray-900">Bayu Salto</p>
                                    <p className="text-[10px] text-gray-400">Mentor</p>
                                </div>
                           </div>
                       </div>
                   </div>
                </div>
             </div>

             {/* Your Lesson List Preview */}
             <div className="mt-4">
                  <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-bold text-gray-900">Your Lesson</h2>
                      <span className="text-xs font-bold text-primary cursor-pointer">See all</span>
                  </div>
                  {/* Reuse basic table style for now or simple list */}
                   <div className="bg-white rounded-2xl p-4 border border-gray-100">
                        <div className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer">
                            <div className="flex items-center gap-3">
                                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Padhang" className="w-10 h-10 rounded-full" />
                                <div>
                                    <p className="text-sm font-bold text-gray-900">Padhang Satrio</p>
                                    <p className="text-xs text-gray-400">2/16/2004</p>
                                </div>
                            </div>
                            <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded">UI/UX DESIGN</span>
                            <div className="hidden md:block text-sm font-medium text-gray-700">Understand Of UI/UX Design</div>
                            <button className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-400">›</button>
                        </div>
                   </div>
             </div>

         </div>

         {/* Right Sidebar - Statistics */}
         <div className="w-full md:w-80 flex flex-col gap-8">
            
            {/* Header / Profile Actions placeholder for mobile, but hidden in desktop since Sidebar covers it? 
                Actually Topbar is in Middle Column. This column is pure stats. 
            */}
            
            <div className="hidden md:flex justify-end gap-4 mb-4">
                 {/* Topbar Right Actions could be here if we wanted strictly 3 column, 
                     but layout in mock puts search in middle. 
                     We'll stick to 'Statistic' header here.
                 */}
            </div>

            {/* Statistic Card */}
            <h3 className="text-xl font-bold text-gray-900">Statistic</h3>
            
            <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm text-center">
                <div className="relative inline-block mb-4">
                    <div className="w-24 h-24 rounded-full p-1 border-2 border-dashed border-primary/40">
                         <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jason" alt="User" className="w-full h-full rounded-full bg-gray-100" />
                    </div>
                    <span className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">32%</span>
                </div>
                
                <h3 className="text-lg font-bold text-gray-900">Good Morning Prashiksha 🔥</h3>
                <p className="text-xs text-gray-400 mb-6">Continue your learning to achieve your target!</p>
                
                {/* Chart Placeholder */}
                <div className="bg-gray-50 rounded-2xl p-4 h-40 flex items-end justify-between px-2">
                     <div className="w-4 bg-primary/20 rounded-t-lg h-1/3"></div>
                     <div className="w-4 bg-primary/40 rounded-t-lg h-1/2"></div>
                     <div className="w-4 bg-primary/20 rounded-t-lg h-1/4"></div>
                     <div className="w-4 bg-primary rounded-t-lg h-full shadow-lg shadow-primary/30"></div>
                     <div className="w-4 bg-primary/20 rounded-t-lg h-1/4"></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-400 mt-2 px-1">
                    <span>1-10 Aug</span>
                    <span>11-20 Aug</span>
                    <span>21-30 Aug</span>
                </div>
            </div>

            {/* Your Mentor */}
            <div>
                 <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-gray-900">Team Members</h3>
                      <button className="w-6 h-6 rounded-full bg-white border border-gray-200 flex items-center justify-center text-primary">+</button>
                  </div>
                  
                  <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm space-y-6">
                      {[
                        { name: "Sachin Sharma", role: "Team Member", seed: "Sachin" },
                        { name: "Siddhant Dhungel", role: "Team Member", seed: "Siddhant" },
                        { name: "Prashiksha Shrestha", role: "Team Member", seed: "Prashiksha" }
                      ].map((mentor, i) => (
                          <div key={i} className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                  <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${mentor.seed}`} className="w-10 h-10 rounded-full bg-gray-100" />
                                  <div>
                                      <p className="text-sm font-bold text-gray-900">{mentor.name}</p>
                                      <p className="text-xs text-gray-400">{mentor.role}</p>
                                  </div>
                              </div>
                              <button className="text-xs font-bold text-primary flex items-center gap-1 hover:text-black">
                                  <span>&</span> Follow
                              </button>
                          </div>
                      ))}
                      
                      <button className="w-full py-3 bg-primary/10 text-primary font-bold rounded-xl text-xs hover:bg-primary/20 transition-colors">
                          See All
                      </button>
                  </div>
            </div>

         </div>

      </div>
    </div>
  );
};

export default Home;
