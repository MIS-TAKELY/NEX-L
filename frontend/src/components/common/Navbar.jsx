import { logout as reduxLogout } from "@/store/slices/authSlice";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";

import { signOut } from "@/lib/auth.client";
import { useGetCartQuery } from "@/store/slices/cartApi";
import logo from "../../assets/logoo.png";
import ProfileDropdown from "./ProfileDropdown";
import ModeToggle from "./ModeToggle";

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation(); // to track current page
  const { isLoggedIn, userRole } = useSelector((state) => state.auth);
  const { data: cartResp } = useGetCartQuery(undefined, { skip: !isLoggedIn || userRole !== 'student' });
  const cartCount = cartResp?.data?.items?.length || 0;

  const [isScrolled, setIsScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [active, setActive] = useState(location.pathname);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setShowNavbar(false);
      } else {
        setShowNavbar(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  // Update active when route changes
  useEffect(() => {
    setActive(location.pathname);
  }, [location]);

  // Helper function to get dashboard path based on role
  const getDashboardPath = () => {
    if (userRole === 'instructor') return '/instructor/dashboard';
    if (userRole === 'admin') return '/admin/dashboard';
    return '/student/dashboard';
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      // Always clear local state
      dispatch(reduxLogout());
      navigate('/', { replace: true });
      setIsMobileMenuOpen(false);
    }
  };

  const desktopButtons = [
    { label: "Home", path: "/" },
    { label: "Courses", path: "/course-list" },
    { label: "About Us", path: "/about" },
    { label: "Contact Us", path: "/contact" },
  ];

  return (
    <>
      <nav
        className={`fixed left-0 right-0 py-5 z-50 transition-all duration-700 ${
          isScrolled || location.pathname !== "/"
            ? "bg-card/80 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/5"
            : "bg-transparent mt-2"
        } ${showNavbar ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full flex justify-between items-center relative">
          <div
            className="flex items-center gap-2 cursor-pointer z-50 group"
            onClick={() => {
              navigate("/");
              setIsMobileMenuOpen(false);
            }}
          >
            <img src={logo} alt="NEXL Logo" className="w-9 h-9 sm:w-10 sm:h-10 object-contain group-hover:scale-105 transition-transform" />
            <span className="text-xl font-bold tracking-tight text-foreground">
              EXL
            </span>
          </div>

          {/* Desktop Links (Center) */}
          <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 items-center gap-1 xl:gap-4 glass px-2 py-1.5 rounded-2xl border border-white/10 shadow-sm">
            {desktopButtons.map((btn) => (
              <button
                key={btn.path}
                onClick={() => {
                  navigate(btn.path);
                  setActive(btn.path);
                }}
                className={`px-4 py-2 font-bold text-[11px] tracking-widest uppercase relative transition-all duration-300 hover:cursor-pointer group whitespace-nowrap rounded-xl ${
                  active === btn.path 
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-primary hover:bg-primary/5"
                }`}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* Desktop Actions (Right) */}
          <div className="hidden lg:flex items-center gap-6">
            <ModeToggle />
            <div className="w-px h-6 bg-border/50 hidden md:block"></div>

            {isLoggedIn ? (
              <div className="flex items-center gap-6">
                {/* Cart Button - Only for Students */}
                {userRole === 'student' && (
                  <button
                    onClick={() => navigate('/cart')}
                    className={`w-11 h-11 rounded-full hover:cursor-pointer flex items-center justify-center transition-all relative bg-secondary hover:bg-muted text-primary`}
                  >
                    <Icon icon="solar:cart-large-2-bold" size={24} />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary rounded-full flex items-center justify-center text-[10px] font-black text-primary-foreground">
                        {cartCount}
                      </span>
                    )}
                  </button>
                )}

                {/* Profile Dropdown */}
                <ProfileDropdown />
              </div>
            ) : (
              <div className="flex items-center gap-6">
                <button
                  onClick={() => {
                    navigate("/login");
                    setActive("/login");
                  }}
                  className={`font-bold text-xs tracking-widest uppercase transition-all text-muted-foreground hover:text-primary`}
                >
                  Sign In
                </button>

                <button
                  onClick={() => {
                    navigate("/signup");
                    setActive("/signup");
                  }}
                  className={`px-8 py-3 rounded-2xl font-black text-xs tracking-widest uppercase transition-all shadow-xl active:scale-95 bg-primary text-primary-foreground hover:bg-primary-hover shadow-primary/20`}
                >
                  Get Started
                </button>
              </div>
            )}
          </div>

          {/* Mobile Controls & Hamburger */}
          <div className="lg:hidden flex items-center gap-3 z-50">
            <ModeToggle />
            {isLoggedIn && userRole === 'student' && (
              <button
                onClick={() => {
                  navigate('/cart');
                  setIsMobileMenuOpen(false);
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center transition-all relative bg-secondary text-primary"
              >
                <Icon icon="solar:cart-large-2-bold" size={20} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full flex items-center justify-center text-[9px] font-black text-primary-foreground">
                    {cartCount}
                  </span>
                )}
              </button>
            )}
            <button
              className="p-2 transition-colors text-foreground"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              <Icon
                icon={
                  isMobileMenuOpen
                    ? "solar:close-circle-bold"
                    : "solar:hamburger-menu-linear"
              }
              size={28}
            />
          </button>
        </div>
      </div>
    </nav>

      {/* Mobile Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden ${
          isMobileMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Mobile Side Drawer */}
      <div
        className={`fixed top-0 right-0 bottom-0 w-[280px] sm:w-[320px] bg-card border-l border-white/10 shadow-2xl z-40 flex flex-col p-6 transition-transform duration-500 ease-out lg:hidden ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center gap-2 mb-10 pt-2">
          <img src={logo} alt="NEXL Logo" className="w-8 h-8 object-contain" />
          <span className="text-lg font-bold tracking-tight text-foreground">NEXL</span>
        </div>

        <div className="flex flex-col space-y-2 flex-grow">
          {desktopButtons.map((btn, idx) => (
            <button
              key={btn.path}
              onClick={() => {
                navigate(btn.path);
                setActive(btn.path);
                setIsMobileMenuOpen(false);
              }}
              style={{ transitionDelay: `${idx * 50}ms` }}
              className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-[13px] tracking-widest uppercase transition-all duration-300 transform ${
                isMobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
              } ${
                active === btn.path 
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              }`}
            >
              {btn.label}
            </button>
          ))}

          {isLoggedIn && (
            <button
              onClick={() => {
                const path = getDashboardPath();
                navigate(path);
                setActive(path);
                setIsMobileMenuOpen(false);
              }}
              style={{ transitionDelay: `${desktopButtons.length * 50}ms` }}
              className={`w-full text-left px-5 py-4 rounded-2xl font-bold text-[13px] tracking-widest uppercase transition-all duration-300 transform ${
                isMobileMenuOpen ? "translate-x-0 opacity-100" : "translate-x-8 opacity-0"
              } ${
                active === getDashboardPath()
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
              }`}
            >
              Dashboard
            </button>
          )}
        </div>

        <div className={`mt-auto space-y-4 pt-6 border-t border-white/5 transition-all duration-500 delay-200 transform ${
          isMobileMenuOpen ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"
        }`}>
          {!isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  navigate("/login");
                  setActive("/login");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-4 font-bold text-[13px] tracking-widest uppercase text-muted-foreground hover:text-primary transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  navigate("/signup");
                  setActive("/signup");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-4 rounded-2xl bg-primary text-primary-foreground font-black text-[13px] tracking-widest uppercase shadow-lg shadow-primary/20"
              >
                Get Started
              </button>
            </>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full py-4 flex items-center justify-center gap-3 rounded-2xl bg-muted/50 text-destructive font-bold text-[13px] tracking-widest uppercase hover:bg-destructive/10 transition-colors"
            >
              <Icon icon="solar:logout-2-bold" size={20} />
              Logout
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
