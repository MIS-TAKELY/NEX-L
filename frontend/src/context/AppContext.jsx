import { signOut as authSignOut, getSession } from "@/lib/auth.client";
import { resolveActiveRole } from "@/utils/roles";
import { createContext, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTheme as reduxToggleTheme, setTheme as reduxSetTheme } from "@/store/slices/uiSlice";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);

  const setTheme = (newTheme) => {
    dispatch(reduxSetTheme(newTheme));
  };

  const toggleTheme = () => {
    dispatch(reduxToggleTheme());
  };

  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );
  const [userRole, setUserRole] = useState(
    localStorage.getItem('userRole') || null
  );
  const [userData, setUserData] = useState(() => {
    try {
      const stored = localStorage.getItem('userData');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      console.error("Failed to parse userData", e);
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  // Verify session on app load
  useEffect(() => {
    const verifySession = async () => {
      try {
        const session = await getSession();
        if (session && session.user) {
          const path = window.location.pathname || "";
          let inferred = null;
          if (path.startsWith("/instructor")) inferred = "instructor";
          else if (path.startsWith("/student")) inferred = "student";
          else if (path.startsWith("/admin")) inferred = "admin";
          const stored = localStorage.getItem("userRole");
          const role = resolveActiveRole(session.user, stored, inferred);

          setIsLoggedIn(true);
          setUserRole(role);
          setUserData(session.user);
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userRole', role);
          localStorage.setItem('userData', JSON.stringify(session.user));
        } else {
          // No active session, clear local storage
          setIsLoggedIn(false);
          setUserRole(null);
          setUserData(null);
          localStorage.removeItem('isLoggedIn');
          localStorage.removeItem('userRole');
          localStorage.removeItem('userData');
        }
      } catch (error) {
        console.error("Session verification failed:", error);
        // Clear on error
        setIsLoggedIn(false);
        setUserRole(null);
        setUserData(null);
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  // Theme logic is now handled via Redux

  const login = (role, data = null) => {
    setIsLoggedIn(true);
    setUserRole(role);
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userRole', role);

    if (data) {
      setUserData(data);
      localStorage.setItem('userData', JSON.stringify(data));
    }
  };

  const logout = async () => {
    try {
      await authSignOut();
    } catch (error) {
      console.error("Logout error:", error);
    }

    setIsLoggedIn(false);
    setUserRole(null);
    setUserData(null);
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
  };

  const updateUserData = (newData) => {
    const updatedUser = { ...userData, ...newData };
    setUserData(updatedUser);
    localStorage.setItem('userData', JSON.stringify(updatedUser));
  };

  // Cart Logic
  const [cart, setCart] = useState(() => {
    try {
      const stored = localStorage.getItem('cart');
      const parsed = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      console.error("Failed to parse cart from local storage", e);
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const addToCart = (course) => {
    setCart((prev) => {
      if (prev.find((item) => item.id === course.id)) return prev;
      return [...prev, course];
    });
  };

  const removeFromCart = (courseId) => {
    setCart((prev) => prev.filter((item) => item.id !== courseId));
  };

  const value = {
    isLoggedIn,
    userRole,
    userData,
    loading,
    theme,
    setTheme,
    toggleTheme,
    login,
    logout,
    updateUserData,
    cart,
    addToCart,
    removeFromCart
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
