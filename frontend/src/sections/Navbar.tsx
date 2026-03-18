import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, GraduationCap, Sun, Moon, LayoutDashboard, LogOut } from 'lucide-react';
import { AppContext } from '@/context/AppContext';

const navLinks = [
  { name: 'Features', href: '#features' },
  { name: 'How It Works', href: '#how-it-works' },
  { name: 'Testimonials', href: '#testimonials' },
];

export function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme, isLoggedIn, userRole, logout } = useContext(AppContext);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'glass' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-foreground">
              NEXL
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="text-muted-foreground hover:text-foreground"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </Button>
            {isLoggedIn ? (
              <>
                <Button 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-foreground flex items-center gap-2"
                  onClick={() => navigate(`/${userRole}`)}
                >
                  <LayoutDashboard className="w-4 h-4" />
                  Dashboard
                </Button>
                <Button 
                  variant="outline"
                  className="border-border hover:bg-secondary flex items-center gap-2"
                  onClick={logout}
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
                <Button 
                  className="gradient-primary hover:opacity-90 text-primary-foreground border-0"
                  onClick={() => navigate('/signup')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 text-foreground"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden glass border-t border-border">
          <div className="px-4 py-6 space-y-4">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="block text-muted-foreground hover:text-foreground transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.name}
              </a>
            ))}
            <div className="pt-4 space-y-3">
              <Button
                variant="ghost"
                onClick={toggleTheme}
                className="w-full flex items-center justify-between text-muted-foreground"
              >
                <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </Button>
              {isLoggedIn ? (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground flex items-center gap-2"
                    onClick={() => {
                      navigate(`/${userRole}`);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LayoutDashboard className="w-4 h-4" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-destructive flex items-center gap-2"
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => {
                      navigate('/login');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    className="w-full gradient-primary text-primary-foreground border-0"
                    onClick={() => {
                      navigate('/signup');
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
