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
        className={`fixed left-0 right-0 flex justify-between items-center px-6 lg:px-12 py-5 z-40 transition-all duration-700 ${
          isScrolled || location.pathname !== "/"
            ? "bg-card/80 backdrop-blur-2xl border-b border-white/10 shadow-lg shadow-black/5"
            : "bg-transparent mt-2"
        } ${showNavbar ? "translate-y-0" : "-translate-y-full"}`}
      >
        <div
          className="flex items-center gap-2 cursor-pointer z-50 group"
          onClick={() => navigate("/")}
        >
          <img src={logo} alt="NEXL Logo" className="w-10 h-10 object-contain group-hover:scale-105 transition-transform" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            NEXL
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

        {/* Mobile Hamburger Button */}
        <button
          className={`lg:hidden z-50 p-2 transition-colors text-primary`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <Icon
            icon={
              isMobileMenuOpen
                ? "solar:close-circle-linear"
                : "solar:hamburger-menu-linear"
            }
            size={28}
          />
        </button>
      </nav>

      <div
        className={`fixed inset-0 bg-primary z-30 flex flex-col items-center justify-center space-y-8 transition-transform duration-300 lg:hidden ${isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
      >
        {isLoggedIn ? (
          <>
            <button
              onClick={() => {
                const dashboardPath = getDashboardPath();
                navigate(dashboardPath);
                setActive(dashboardPath);
                setIsMobileMenuOpen(false);
              }}
              className="text-primary-foreground text-2xl font-medium relative group"
            >
              Go to Dashboard
              <span
                className={`absolute left-0 -bottom-1 h-0.5 bg-background transition-all duration-700 ease-out w-0 group-hover:w-full`}
              ></span>
            </button>
            <button
              onClick={handleLogout}
              className="bg-background text-primary px-8 py-3 rounded-lg text-xl font-bold shadow-lg relative group flex items-center gap-2"
            >
              <Icon icon="solar:logout-2-linear" className="h-5 w-5" />
              Logout
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => {
                navigate("/about");
                setActive("/about");
                setIsMobileMenuOpen(false);
              }}
              className="text-primary-foreground text-2xl font-medium relative group"
            >
              About Us
              <span
                className={`absolute left-0 -bottom-1 h-0.5 bg-background transition-all duration-700 ease-out w-0 group-hover:w-full`}
              ></span>
            </button>
            <button
              onClick={() => {
                navigate("/contact");
                setActive("/contact");
                setIsMobileMenuOpen(false);
              }}
              className="text-primary-foreground text-2xl font-medium relative group"
            >
              Contact Us
              <span
                className={`absolute left-0 -bottom-1 h-0.5 bg-background transition-all duration-700 ease-out w-0 group-hover:w-full`}
              ></span>
            </button>
            <button
              onClick={() => {
                navigate("/login");
                setActive("/login");
                setIsMobileMenuOpen(false);
              }}
              className="text-primary-foreground text-2xl font-medium relative group"
            >
              Sign In
              <span
                className={`absolute left-0 -bottom-1 h-0.5 bg-background transition-all duration-700 ease-out w-0 group-hover:w-full`}
              ></span>
            </button>
            <button
              onClick={() => {
                navigate("/signup");
                setActive("/signup");
                setIsMobileMenuOpen(false);
              }}
              className="bg-background text-primary px-8 py-3 rounded-lg text-xl font-bold shadow-lg relative group"
            >
              Get Started
              <span
                className={`absolute left-0 bottom-0 h-0.5 bg-primary transition-all duration-700 ease-out w-0 group-hover:w-full`}
              ></span>
            </button>
          </>
        )}
      </div>
    </>
  );
};

export default Navbar;
