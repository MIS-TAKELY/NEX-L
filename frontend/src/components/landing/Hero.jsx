import { useNavigate } from 'react-router-dom';

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col min-w-screen overflow-hidden relative">
      <header className="relative flex-1 flex flex-col justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="/hero-bg.png" 
            alt="Learning Environment" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/70"></div>
        </div>

        {/* Centered Content */}
        <div className="relative z-10 text-center text-white px-6 pt-24">
          <h1 className="text-5xl lg:text-7xl font-bold mb-6 tracking-tight drop-shadow-2xl">
            NEXL: Elevate Your Learning
          </h1>
          <p className="text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed text-white/90 drop-shadow-lg">
            Explore breathtaking courses, local culture, and unique learning experiences.
          </p>
        </div>
      </header>

      {/* Floating Action Card */}
<div className="relative -mt-5 z-20 p-[0.75px]">
<div className="relative -mt-10 z-20">

          <div className="bg-white/95 backdrop-blur-md shadow-[0_30px_100px_rgba(0,0,0,0.4),0_10px_30px_rgba(0,0,0,0.2)] hover:shadow-[0_40px_120px_rgba(0,0,0,0.5),0_15px_40px_rgba(0,0,0,0.3)] hover:-translate-y-2 transition-all duration-500 px-8 lg:px-12 py-10 border border-primary border-4 border-primary rounded-4xl group">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6 items-end">
              
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-500 ring-4 ring-white/10">
                    📘
                  </div>
                  <div>
                    <h3 className="text-2xl lg:text-4xl font-extrabold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                      Start Learning
                    </h3>
                    <p className="text-sm font-medium text-gray-500">
                      Premium quality courses await you
                    </p>
                  </div>
                </div>
              </div>

              <select className="px-4 py-3 border-2 border-gray-200 rounded-xl">
                <option>All Categories</option>
                <option>Web Development</option>
                <option>Data Science</option>
                <option>Design</option>
              </select>

              <select className="px-4 py-3 border-2 border-gray-200 rounded-xl">
                <option>All Levels</option>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>

              <button
                onClick={() => navigate('/course-list')}
                className="px-8 py-4 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl font-bold hover:scale-105 transition"
              >
                Search Courses 🔍
              </button>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
