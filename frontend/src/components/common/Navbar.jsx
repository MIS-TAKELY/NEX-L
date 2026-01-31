import { Menu, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={`fixed left-0 right-0 flex justify-between items-center px-6 lg:px-12 py-4 z-40 transition-all duration-300 ${
        isScrolled 
          ? 'top-0 bg-primary shadow-lg' 
          : 'top-0 lg:top-6 bg-transparent'
      }`}>
        <div className="text-2xl font-bold text-white cursor-pointer z-50" onClick={() => navigate('/')}>
          NEX-L
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex space-x-6">
          <button onClick={() => navigate('/home')} className="px-5 py-2 text-white/90 font-medium hover:text-white transition-colors">Student Page</button>
          <button onClick={() => navigate('/login')} className="px-5 py-2 text-white/90 font-medium hover:text-white transition-colors">Sign In</button>
          <button onClick={() => navigate('/signup')} className={`px-6 py-2.5 rounded-full font-bold transition-all shadow-lg ${
            isScrolled
              ? 'bg-white text-primary hover:bg-gray-100'
              : 'bg-white text-primary hover:bg-gray-100'
          }`}>Get Started</button>
        </div>

        {/* Mobile Hamburger Button */}
        <button 
          className="lg:hidden text-white z-50 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </nav>

      {/* Mobile Menu Overlay */}
      <div className={`fixed inset-0 bg-[#677691] z-30 flex flex-col items-center justify-center space-y-8 transition-transform duration-300 lg:hidden ${
        isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <button 
          onClick={() => {
            navigate('/home');
            setIsMobileMenuOpen(false);
          }} 
          className="text-white text-2xl font-medium"
        >
          Student Page
        </button>
        <button 
          onClick={() => {
            navigate('/login');
            setIsMobileMenuOpen(false);
          }} 
          className="text-white text-2xl font-medium"
        >
          Sign In
        </button>
        <button 
          onClick={() => {
            navigate('/signup');
            setIsMobileMenuOpen(false);
          }} 
          className="bg-white text-[#677691] px-8 py-3 rounded-full text-xl font-bold shadow-lg"
        >
          Get Started
        </button>
      </div>
    </>
  );
};

export default Navbar;
