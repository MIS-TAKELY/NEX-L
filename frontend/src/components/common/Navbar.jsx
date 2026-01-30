import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const navigate = useNavigate();
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed left-0 right-0 flex justify-between items-center px-6 lg:px-12 py-4 z-40 transition-all duration-300 ${
      isScrolled 
        ? 'top-0 bg-primary shadow-lg' 
        : 'top-6 bg-transparent'
    }`}>
      <div className="text-2xl font-bold text-white cursor-pointer" onClick={() => navigate('/')}>
        NEX-L
      </div>
      <div className="space-x-6">
        <button onClick={() => navigate('/home')} className="px-5 py-2 text-white/90 font-medium hover:text-white transition-colors">Student Page</button>
        <button onClick={() => navigate('/login')} className="px-5 py-2 text-white/90 font-medium hover:text-white transition-colors">Sign In</button>
        <button onClick={() => navigate('/signup')} className={`px-6 py-2.5 rounded-full font-bold transition-all shadow-lg ${
          isScrolled
            ? 'bg-white text-primary hover:bg-gray-100'
            : 'bg-white text-primary hover:bg-gray-100'
        }`}>Get Started</button>
      </div>
    </nav>
  );
};

export default Navbar;
