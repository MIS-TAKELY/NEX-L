import React from 'react';
import { Wallet, Sparkles, Trophy } from 'lucide-react';

const About = () => {
  const features = [
    { title: "Local Payment Integration", desc: "Seamlessly enroll in courses using eSewa, Khalti, and IME Pay with low transaction fees.", Icon: Wallet },
    { title: "AI-Powered Learning", desc: "Benefit from automatic video summarization and personalized course recommendations.", Icon: Sparkles },
    { title: "Gamified Progress", desc: "Stay motivated by earning performance badges and tracking your achievements.", Icon: Trophy }
  ];

  return (
    <section id="about" className="py-20 md:py-32 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 md:mb-24">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground serif">
            About Us
          </h2>
          <p className="text-muted-foreground font-light text-lg leading-relaxed max-w-xl mx-auto font-outfit">
            We provide the best learning experience with features designed for your success.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-8 pb-10 rounded-md bg-muted border border-transparent hover:border-border hover:shadow-xl transition-all duration-300 group"
            >
              <div className="w-14 h-14 rounded-md bg-primary/10 text-primary flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-300">
                <feature.Icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-foreground serif">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed font-outfit">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>
        
        <div className="text-center">
          <button className="inline-flex items-center gap-2 text-sm font-bold text-gray-800 hover:text-primary transition-colors group">
            Learn More
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default About;
