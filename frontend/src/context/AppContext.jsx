import { createContext, useState, useEffect } from "react";
import { getSession, signOut as authSignOut } from "@/lib/auth.client";

// eslint-disable-next-line react-refresh/only-export-components
export const AppContext = createContext();

export const AppContextProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(
    localStorage.getItem('isLoggedIn') === 'true'
  );
  const [userRole, setUserRole] = useState(
    localStorage.getItem('userRole') || null
  );
  const [userData, setUserData] = useState(() => {
    const stored = localStorage.getItem('userData');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(true);

  // Verify session on app load
  useEffect(() => {
    const verifySession = async () => {
      try {
        const session = await getSession();
        if (session && session.user) {
          // Extract role from backend session
          const role = session.user.role || 'student';

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

  const value = {
    isLoggedIn,
    userRole,
    userData,
    loading,
    login,
    logout
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};
