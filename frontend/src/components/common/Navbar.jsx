import { Icon } from '@iconify/react';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import logo from '../../assets/logoo.png';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation(); // to track current page
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [active, setActive] = useState(location.pathname); // active button

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Update active when route changes
  useEffect(() => {
    setActive(location.pathname);
  }, [location]);

  const desktopButtons = [
    { label: 'Home', path: '/' },
    { label: 'Courses', path: '/course-list' },
    { label: 'Sign In', path: '/login' },
  ];

  return (
    <>
      <nav
        className={`fixed left-0 right-0 flex justify-between items-center px-6 lg:px-12 py-4 z-40 transition-all duration-300 ${
          isScrolled ? 'top-0 bg-primary shadow-lg' : 'top-0 lg:top-6 bg-transparent'
        }`}
      >
        <div
          className="flex items-center gap-1 cursor-pointer z-50 px-2 py-1 relative group"
          onClick={() => navigate('/')}
        >
          <img src={logo} alt="NEXL" className="h-8 w-auto brightness-0 invert" />
          <span className="text-2xl font-bold text-white">EXL</span>
          {/* Underline for Logo (Home) */}
          <span
            className={`absolute left-0 bottom-0 h-[2px] bg-white transition-all duration-700 ease-out w-0 group-hover:w-full`}
          ></span>
        </div>

        {/* Desktop Menu */}
        <div className="hidden lg:flex space-x-6">
          {desktopButtons.map((btn) => (
            <button
              key={btn.path}
              onClick={() => {
                navigate(btn.path);
                setActive(btn.path);
              }}
              className={`px-5 py-2 text-white/90 font-medium relative transition-colors duration-300 hover:text-white group`}
            >
              {btn.label}
              {/* Underline */}
              <span
                className={`absolute left-0 bottom-0 h-[2px] bg-white transition-all duration-700 ease-out w-0 group-hover:w-full`}
              ></span>
            </button>
          ))}

          {/* Get Started button */}
          <button
            onClick={() => {
              navigate('/signup');
              setActive('/signup');
            }}
            className={`px-6 py-2.5 rounded-full font-bold transition-all shadow-lg bg-white text-primary hover:bg-gray-100 relative group`}
          >
            Get Started
            <span
              className={`absolute left-0 bottom-0 h-[2px] bg-primary transition-all duration-700 ease-out w-0 group-hover:w-full`}
            ></span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="lg:hidden text-white z-50 p-2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Icon icon={isMobileMenuOpen ? "solar:close-circle-linear" : "solar:hamburger-menu-linear"} size={28} />
        </button>
      </nav>

      <div
        className={`fixed inset-0 bg-primary z-30 flex flex-col items-center justify-center space-y-8 transition-transform duration-300 lg:hidden ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <button
          onClick={() => {
            navigate('/student');
            setActive('/student');
            setIsMobileMenuOpen(false);
          }}
          className="text-white text-2xl font-medium relative group"
        >
          Student Dashboard
          <span className={`absolute left-0 -bottom-1 h-[2px] bg-white transition-all duration-700 ease-out w-0 group-hover:w-full`}></span>
        </button>
        <button
          onClick={() => {
            navigate('/login');
            setActive('/login');
            setIsMobileMenuOpen(false);
          }}
          className="text-white text-2xl font-medium relative group"
        >
          Sign In
          <span className={`absolute left-0 -bottom-1 h-[2px] bg-white transition-all duration-700 ease-out w-0 group-hover:w-full`}></span>
        </button>
        <button
          onClick={() => {
            navigate('/signup');
            setActive('/signup');
            setIsMobileMenuOpen(false);
          }}
          className="bg-white text-primary px-8 py-3 rounded-full text-xl font-bold shadow-lg relative group"
        >
          Get Started
          <span className={`absolute left-0 bottom-0 h-[2px] bg-primary transition-all duration-700 ease-out w-0 group-hover:w-full`}></span>
        </button>
      </div>
    </>
  );
};

export default Navbar;
