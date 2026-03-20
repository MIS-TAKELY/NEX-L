import React from 'react';

const CTA = () => {
  return (
    <section className="py-24 md:py-40 px-6 bg-primary text-primary-foreground relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-96 h-96 bg-background/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-96 h-96 bg-black/10 rounded-full blur-3xl"></div>

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <h2 className="text-4xl md:text-6xl font-bold mb-6 serif tracking-tight">
          Ready to start learning?
        </h2>
        <p className="text-primary-foreground/80 font-normal text-lg md:text-xl mb-10 max-w-xl mx-auto font-outfit">
          Join thousands of students already learning on NEXL. Start your journey today.
        </p>
        <button className="px-10 py-4 bg-background text-primary rounded-full text-sm font-bold shadow-xl hover:shadow-2xl hover:bg-gray-50 transition-all hover:-translate-y-1 font-outfit">
          Get started for free
        </button>
      </div>
    </section>
  );
};

export default CTA;
