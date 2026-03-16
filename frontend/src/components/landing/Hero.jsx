import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col min-w-full overflow-x-hidden relative">
      <header className="relative flex-1 flex flex-col justify-center overflow-hidden min-h-[645px] h-[92vh] pb-10">
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
        <div className="relative z-10 text-center text-white px-4 md:px-6 pt-20 lg:pt-16 pb-12">
          <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold mb-4 md:mb-6 tracking-tight drop-shadow-2xl">
            NEXL : Elevate Your Learning
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl max-w-3xl mx-auto leading-relaxed text-white/90 drop-shadow-lg">
            Learn new skills, master your subjects, and achieve more.
          </p>
        </div>
      </header>

      {/* Floating Action Card */}
      <div className="relative z-20 px-4 md:px-12 -mt-4 md:-mt-12 lg:-mt-8 pb-12">
        <div
          className="
            bg-white/95 backdrop-blur-md
            shadow-[0_20px_60px_rgba(0,0,0,0.25)]
            hover:shadow-[0_25px_70px_rgba(0,0,0,0.3)]
            hover:-translate-y-1
            transition-all duration-500
            p-6 md:px-8 lg:px-12 md:py-10
            border-4 border-primary
            rounded-2xl
            group
          "
        >
          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
            <div className="w-full md:w-auto flex items-center justify-start gap-4 md:mr-4">
              <div className="w-12 h-12 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform duration-500 shrink-0">
                📘
              </div>
              <div className="text-left">
                <h3 className="text-xl md:text-2xl lg:text-3xl font-extrabold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
                  Start Learning
                </h3>
                <p className="text-xs md:text-sm font-medium text-gray-500">
                  Premium quality courses await you
                </p>
              </div>
            </div>

            <select className="w-full md:w-56 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary outline-none">
              <option>All Categories</option>
              <option>Web Development</option>
              <option>Data Science</option>
              <option>Design</option>
              <option>Other</option>
            </select>

            <select className="w-full md:w-56 px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary outline-none">
              <option>All Levels</option>
              <option>Beginner</option>
              <option>Intermediate</option>
              <option>Advanced</option>
            </select>

            <button
              onClick={() => navigate("/course-list")}
              className="w-full md:w-auto px-8 py-3 bg-primary text-white rounded-lg font-bold hover:bg-primary-hover transition shadow-md"
            >
              Search
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
