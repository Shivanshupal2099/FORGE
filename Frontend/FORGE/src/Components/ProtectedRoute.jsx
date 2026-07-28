import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  try {
    const { user, loading } = useAuth();
    const location = useLocation();

    console.log('ProtectedRoute - User:', user?.email, 'Loading:', loading, 'Path:', location.pathname);

    // Show loading state while checking authentication
    // Do not redirect while auth state is initializing
    if (loading) {
      console.log('ProtectedRoute - Still loading auth state, showing loading screen');
      return (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <div style={{
            color: 'white',
            fontSize: '1.2rem',
            fontWeight: '600'
          }}>
            Loading...
          </div>
        </div>
      );
    }

    // After loading is complete, check if user is authenticated
    // Only redirect to login if there is no active session
    if (!user) {
      console.log('ProtectedRoute - No active session, redirecting to login');
      console.log('ProtectedRoute - REDIRECT TRIGGERED to /login from ProtectedRoute');
      return <Navigate to="/login" replace state={{ from: location }} />;
    }

    // User is authenticated, render the protected page
    console.log('ProtectedRoute - User authenticated, rendering children');
    return children;
  } catch (error) {
    console.error('ProtectedRoute error:', error);
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
};

export default ProtectedRoute;
