import React, { useEffect, useState } from 'react';
import Navbar from '../components/common/Navbar';
import { Hero } from '../sections/Hero';
import { Features } from '../sections/Features';
import { HowItWorks } from '../sections/HowItWorks';
import { Stats } from '../sections/Stats';
import { Testimonials } from '../sections/Testimonials';
import { CTA } from '../sections/CTA';
import { Footer } from '../sections/Footer';

const LandingPage = () => {
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  return (
    <div className={`min-h-screen bg-background transition-opacity duration-500 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}>
      <div className="gradient-mesh fixed inset-0 pointer-events-none" />
      <Navbar />
      <main className="relative z-10">
        <Hero />
        <Features />
        <HowItWorks />
        <Stats />
        <Testimonials />
        <CTA />
      </main>
      <Footer />
    </div>
  );
};

export default LandingPage;
