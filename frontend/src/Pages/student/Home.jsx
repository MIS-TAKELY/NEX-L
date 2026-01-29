import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col min-h-screen font-outfit text-gray-800">
      
      {/* Navbar Placeholder - In a real app, this might be a separate component */}
      <nav className="flex justify-between items-center px-6 py-4 bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent cursor-pointer" onClick={() => navigate('/')}>
          NEX-L
        </div>
        <div className="space-x-4">
          <button onClick={() => navigate('/login')} className="px-5 py-2 text-gray-600 font-medium hover:text-blue-600 transition-colors">Sign In</button>
          <button onClick={() => navigate('/signup')} className="px-5 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-[#15C435] transition-colors shadow-lg shadow-blue-500/30">Get Started</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="relative py-20 lg:py-32 overflow-hidden bg-gradient-to-b from-blue-50 to-white">
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
          <div className="absolute -top-[20%] -right-[10%] w-[40rem] h-[40rem] bg-purple-200/30 rounded-full blur-3xl" />
          <div className="absolute top-[40%] -left-[10%] w-[30rem] h-[30rem] bg-blue-200/20 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight">
            Master New Skills <br />
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Anytime, Anywhere</span>
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Unlock your potential with our expert-led courses. Join a community of learners and start your journey today.
          </p>
          <div className="flex justify-center gap-4">
            <button onClick={() => navigate('/course-list')} className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-xl shadow-blue-500/20 hover:scale-105 hover:text-pink-300 active:scale-95">
              Explore Courses
            </button>
            <button onClick={() => navigate('/signup')} className="px-8 py-4 bg-white text-gray-800 border border-gray-200 rounded-xl font-bold hover:bg-gray-50 transition-all hover:border-gray-300">
              Join for Free
            </button>
          </div>
          
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent z-10 h-full w-full pointer-events-none"></div>
             {/* Abstract Dashboard/App Preview Placeholder */}
            <div className="mx-auto max-w-5xl bg-white rounded-t-3xl shadow-2xl border border-gray-200 p-2 h-64 lg:h-96 overflow-hidden relative">
               <div className="w-full h-full bg-gray-50 rounded-t-2xl flex items-center justify-center text-gray-300">
                  <span className="text-lg">Dashboard Preview / Course Catalog</span>
               </div>
            </div>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose NEX-L?</h2>
            <p className="text-gray-500 max-w-xl mx-auto">We provide the best learning experience with features designed for your success.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Expert Instructors", desc: "Learn from industry professionals who are experts in their fields.", color: "bg-blue-100 text-blue-600" },
              { title: "Interactive Learning", desc: "Engage with quizzes, assignments, and hands-on projects.", color: "bg-purple-100 text-purple-600" },
              { title: "Lifetime Access", desc: "Learn at your own pace with lifetime access to your enrolled courses.", color: "bg-green-100 text-green-600" }
            ].map((feature, idx) => (
              <div key={idx} className="p-8 rounded-2xl bg-gray-50 hover:bg-white border border-transparent hover:border-gray-100 hover:shadow-xl transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                   {/* Icon Placeholder */}
                   <div className="w-6 h-6 bg-current opacity-50 rounded-full" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <div className="flex justify-center items-center">
      <section className="py-10 pr-16 bg-[#677691] w-full text-white relative overflow-hidden">
        {/* <div className="absolute top-0 right-0 w-96 h-96 bg-pink-600/20 rounded-full blur-[1px] -translate-y-1/9 translate-x-1/8" /> */}
        <div className="container mx-auto px-6 relative z-10 text-center">
          <h2 className="text-3xl lg:text-5xl font-bold mb-6">Ready to Start Learning?</h2>
          <p className="text-gray-400 mb-10 max-w-2xl mx-auto">Join thousands of students and start your journey to success today.</p>
          <button onClick={() => navigate('/signup')} className="px-10 py-4 bg-white text-gray-900 rounded-full font-bold hover:bg-gray-100 transition-colors shadow-lg shadow-white/10 hover:shadow-white/20">
            Sign Up Now
          </button>
        </div>
      </section>
      </div>

      {/* Footer Placeholder */}
      <footer className="bg-gray-50 py-12 border-t border-black-200">
         <div className="container mx-auto px-6 text-center text-gray-400">
            &copy; {new Date().getFullYear()} NEXL. All rights reserved.
         </div>
      </footer>
    </div>
  );
};

export default Home;
