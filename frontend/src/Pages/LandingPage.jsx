import Footer from '../components/common/Footer';
import Navbar from '../components/common/Navbar';
import SocialTopbar from '../components/common/SocialTopbar';

import CoursesSection from '../components/landing/CoursesSection';
import Features from '../components/landing/Features';
import Hero from '../components/landing/Hero';
import Testimonials from '../components/landing/Testimonials';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen font-outfit text-gray-800">
      <SocialTopbar />
      <Navbar />
      <Hero />
      <Features />
      <CoursesSection />
      <Testimonials />
      {/* <CTA /> */}

      <Footer />
    </div>
  );
};

export default LandingPage;
