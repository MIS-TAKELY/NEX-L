import Footer from '../components/common/Footer';
import Navbar from '../components/common/Navbar';
import SocialTopbar from '../components/common/SocialTopbar';
import CTA from '../components/landing/CTA';
import Features from '../components/landing/Features';
import Hero from '../components/landing/Hero';

const LandingPage = () => {
  return (
    <div className="flex flex-col min-h-screen font-outfit text-gray-800">
      <SocialTopbar />
      <Navbar />
      <Hero />
      <Features />
      <CTA />
      <Footer />
    </div>
  );
};

export default LandingPage;
