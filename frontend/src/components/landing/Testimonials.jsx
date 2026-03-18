import React from 'react';
import { testimonials } from '../../data/landingData';

const Testimonials = () => {
  return (
    <section className="py-20 md:py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-4xl md:text-5xl font-bold mb-16 md:mb-24 text-center text-foreground serif">
          Student Stories
        </h2>
        
        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((item) => (
            <blockquote key={item.id} className="space-y-6 p-8 rounded-3xl bg-secondary/30 relative">
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
