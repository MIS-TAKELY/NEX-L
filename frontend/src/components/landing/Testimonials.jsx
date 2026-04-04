import React from 'react';
import { testimonials } from '../../data/landingData';

const Testimonials = () => {
  return (
    <section className="py-20 bg-muted flex justify-center items-center">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-extrabold text-[#1B3452] mb-4">
            Students <span className="text-[#1B3452]">Feedback</span>
          </h2>
          <div className="w-16 h-1 bg-[#d4af37] mx-auto mb-6"></div>
          <p className="text-muted-foreground text-lg">
            Read what our students have to say about their learning journey with NEXL.
          </p>
        </div>

        {/* Carousel Container */}
        <div className="relative flex items-center justify-center">
            
          {/* Previous Button - hidden on small screens */}
          <button 
            onClick={prevTestimonial}
            className="absolute left-0 -ml-4 lg:-ml-12 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm hover:bg-muted hover:text-primary transition-colors focus:outline-none"
            aria-label="Previous testimonial"
          >
            <ChevronLeft size={24} />
          </button>

          {/* Cards Grid */}
          <div className="flex gap-6 w-full overflow-hidden justify-center transition-all duration-300">
            {getVisibleTestimonials().map((testimonial, idx) => (
              <div 
                key={testimonial.id}
                className={`bg-card rounded-md p-8 flex flex-col mx-auto w-full max-w-sm flex-shrink-0 transition-all duration-300 ${idx > 0 ? "hidden md:flex" : "flex"} ${idx === 2 ? "lg:flex hidden" : ""} ${testimonial.empty ? "opacity-0 pointer-events-none" : "shadow-sm border border-border items-center text-center hover:scale-105 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5 z-0 hover:z-10"}`}
              >
                {!testimonial.empty && (
                  <>
                    {/* User Info Route */}
                    <div className="flex flex-col items-center mb-6 w-full">
                        <div className="w-16 h-16 rounded-md bg-primary flex items-center justify-center text-white text-xl font-bold mb-4 shadow-sm">
                          {getInitials(testimonial.name)}
                        </div>
                        <h3 className="text-xl font-bold text-[#1B3452] whitespace-nowrap">{testimonial.name}</h3>
                        <p className="text-muted-foreground font-medium text-sm mb-2 whitespace-nowrap">{testimonial.role}</p>
                        
                        {/* Star Rating */}
                        <div className="flex justify-center gap-1">
                            {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} className="w-4 h-4 fill-[#d4af37] text-[#d4af37]" />
                            ))}
                        </div>
                    </div>

                    {/* Testimonial Text */}
                    <p className="text-foreground italic flex-grow mb-6 leading-relaxed relative">
                      {testimonial.text}
                    </p>

                    {/* Footer Info */}
                    <p className="text-sm font-semibold text-muted-foreground mt-auto">
                      {testimonial.date}
                    </p>
                  </>
                )}
              </div>
            ))}
          </div>

          {/* Next Button - hidden on small screens */}
          <button 
            onClick={nextTestimonial}
            className="absolute right-0 -mr-4 lg:-mr-12 z-10 hidden md:flex h-12 w-12 items-center justify-center rounded-md border border-border bg-card text-muted-foreground shadow-sm hover:bg-muted hover:text-primary transition-colors focus:outline-none"
            aria-label="Next testimonial"
          >
            <ChevronRight size={24} />
          </button>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <blockquote key={item.id} className="space-y-6 p-8 rounded-md bg-secondary/30 relative">
              <div className="text-6xl text-primary/20 font-serif absolute top-4 left-6 leading-none select-none">"</div>
              <p className="text-lg font-light leading-relaxed text-gray-800 font-outfit relative z-10 pt-4">
                {item.quote}
              </p>
              <footer className="space-y-1 font-outfit relative z-10">
                <cite className="not-italic font-bold text-sm text-foreground">
                  {item.author}
                </cite>
                <p className="text-[11px] text-muted-foreground uppercase tracking-wider font-semibold">
                  {item.role} · {item.date}
                </p>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
