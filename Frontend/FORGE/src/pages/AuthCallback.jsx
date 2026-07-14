import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function AuthCallback() {
  const navigate = useNavigate();
  const { supabase } = useAuth();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/home');
      } else {
        navigate('/');
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        navigate('/home');
      } else {
        navigate('/');
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
