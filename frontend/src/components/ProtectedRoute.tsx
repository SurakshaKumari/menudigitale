// components/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useEffect, useState } from 'react';

const ProtectedRoute = () => {
  const { isAuthenticated, initializeAuth } = useAuthStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Initialize auth state on component mount
    initializeAuth();
    setIsInitialized(true);
  }, [initializeAuth]);

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A0C0B]"></div>
      </div>
    );
  }

  // Debug logging
  console.log('ProtectedRoute - isAuthenticated:', isAuthenticated);

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    console.log('Not authenticated, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  console.log('Authenticated, rendering protected routes');
  return <Outlet />;
};

export default ProtectedRoute;