import { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  const syncUserToBackend = async (user) => {
    try {
      await fetch('http://localhost:5000/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uid: user.email,
          email: user.email,
          name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
          picture: user.user_metadata?.avatar_url || null
        })
      });
    } catch (error) {
      console.error('Error syncing user to backend:', error);
    }
  };

  // Track user activity on the frontend
  useEffect(() => {
    if (!user?.email) return;

    const ACTIVITY_PING_INTERVAL = 2 * 60 * 1000; // 2 minutes
    let intervalId = null;

    const pingActivity = async () => {
      try {
        // Make a simple request to update activity timestamp
        await fetch(`http://localhost:5000/api/auth/status/${user.email}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        });
      } catch (error) {
        console.error('Error pinging activity:', error);
      }
    };

    // Initial ping
    pingActivity();

    // Set up interval for activity pings
    intervalId = setInterval(pingActivity, ACTIVITY_PING_INTERVAL);

    // Track user interactions (mouse, keyboard, scroll, click)
    const handleUserActivity = () => {
      // Reset the interval on user activity
      if (intervalId) {
        clearInterval(intervalId);
      }
      pingActivity();
      intervalId = setInterval(pingActivity, ACTIVITY_PING_INTERVAL);
    };

    // Add event listeners for user activity
    window.addEventListener('mousemove', handleUserActivity);
    window.addEventListener('keydown', handleUserActivity);
    window.addEventListener('scroll', handleUserActivity);
    window.addEventListener('click', handleUserActivity);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      window.removeEventListener('mousemove', handleUserActivity);
      window.removeEventListener('keydown', handleUserActivity);
      window.removeEventListener('scroll', handleUserActivity);
      window.removeEventListener('click', handleUserActivity);
    };
  }, [user?.email]);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        setUserId(session.user.id);
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('userId', session.user.id);
        syncUserToBackend(session.user);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        setUser(session.user);
        setUserId(session.user.id);
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('userId', session.user.id);
        await syncUserToBackend(session.user);
      } else {
        setUser(null);
        setUserId(null);
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      setUser(null);
      setUserId(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
  };

  return (
    <AuthContext.Provider value={{ user, userId, loading, signOut, supabase }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
