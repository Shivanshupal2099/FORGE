import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const GuestRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  // If user is logged in, redirect to home
  if (user) {
    return <Navigate to="/home" replace state={{ from: location }} />;
  }

  // Otherwise, render the children (the page that should be accessible to guests)
  return children;
};

export default GuestRoute;