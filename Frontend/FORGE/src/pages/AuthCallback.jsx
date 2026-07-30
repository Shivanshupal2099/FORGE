import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AuthCallback() {
  const navigate = useNavigate();
  const { supabase } = useAuth();

  useEffect(() => {
    // Handle OAuth callback
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/home');
      } else {
        navigate('/');
      }
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('AuthCallback - Auth state change:', _event, 'Session:', !!session);
      
      if (_event === 'SIGNED_IN' && session) {
        // User successfully signed in
        navigate('/home');
      } else if (_event === 'SIGNED_OUT') {
        // User signed out
        navigate('/');
      } else if (_event === 'TOKEN_REFRESHED') {
        // Token was refreshed, no redirect needed
        console.log('AuthCallback - Token refreshed');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, supabase]);

  return (
    <div className="page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <p>Signing in...</p>
    </div>
  );
}

export default AuthCallback;
