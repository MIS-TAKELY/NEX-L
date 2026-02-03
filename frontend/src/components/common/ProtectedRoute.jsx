import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AppContext } from '../../context/AppContext';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { isLoggedIn, userRole, loading } = useContext(AppContext);
  const location = useLocation();

  // Show loading state while verifying session
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    // Redirect to login but save the current location to redirect back after login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Role not authorized, redirect to home/landing
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
