import React from 'react';

const Hero = () => {
  return (
    <section className="pt-32 pb-20 md:pt-48 md:pb-32 px-6">
      <div className="max-w-4xl mx-auto text-center fade-in">
        <h1 className="text-5xl md:text-7xl tracking-tight leading-tight mb-6">
          <span className="serif">Elevate Your</span><br />
          <span className="font-outfit font-normal">Learning</span>
        </h1>
        <p className="text-lg md:text-xl text-gray-500 font-light max-w-2xl mx-auto mb-10 leading-relaxed font-outfit">
          Explore breathtaking courses, local culture, and unique learning experiences designed for the modern learner.
        </p>
        
        {/* Minimal Search */}
        <div className="max-w-xl mx-auto flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 relative border-b border-gray-200 focus-within:border-primary transition-colors pb-2">
            <input 
              type="text" 
              placeholder="Search courses..."
              className="w-full px-0 py-2 bg-transparent outline-none text-lg text-foreground placeholder:text-gray-400 font-outfit"
            />
          </div>
          <button className="px-8 py-3.5 bg-[#171717] text-foreground rounded-[1.5rem] text-sm font-medium hover:bg-black transition-colors shrink-0">
            Search
          </button>
        </div>
      </div>
    </section>
  );
};

export default Hero;
