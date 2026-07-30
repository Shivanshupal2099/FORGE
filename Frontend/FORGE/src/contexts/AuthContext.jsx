import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { createClient } from "@supabase/supabase-js";
import axios from '../api/axios';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
  {
    auth: {
      redirectURL: window.location.origin,
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    }
  }
);

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [userId, setUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage on mount for persistence
  useEffect(() => {
    const token = localStorage.getItem('token');
    const savedUserId = localStorage.getItem('userId');
    console.log('AuthContext - Checking localStorage persistence:', !!token, !!savedUserId);
    
    if (token && savedUserId) {
      // Token exists, but we still need to verify with Supabase
      // This will be handled by the getSession call below
    }
  }, []);    

  const syncUserToBackend = useCallback(async (user) => {
    try {
      const response = await axios.post('/api/auth/sync', {
        uid: user.email,
        email: user.email,
        name: user.user_metadata?.full_name || user.email?.split('@')[0] || '',
        picture: user.user_metadata?.avatar_url || null
      });

      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
    } catch (error) {
      console.error('Error syncing user to backend:', error);
    }
  }, []);

  // Track user activity on the frontend
  const pingActivity = useCallback(async (email) => {
    try {
      // Make a simple request to update activity timestamp
      await axios.get(`/api/auth/status/${email}`);
    } catch (error) {
      console.error('Error pinging activity:', error);
    }
  }, []);

  useEffect(() => {
    if (!user?.email) return;

    const ACTIVITY_PING_INTERVAL = 2 * 60 * 1000; // 2 minutes
    let intervalId = null;

    // Initial ping
    pingActivity(user.email);

    // Set up interval for activity pings
    intervalId = setInterval(() => {
      pingActivity(user.email);
    }, ACTIVITY_PING_INTERVAL);

    // Track user interactions (mouse, keyboard, scroll, click)
    const handleUserActivity = () => {
      // Reset the interval on user activity
      if (intervalId) {
        clearInterval(intervalId);
      }
      pingActivity(user.email);
      intervalId = setInterval(() => {
        pingActivity(user.email);
      }, ACTIVITY_PING_INTERVAL);
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
  }, [user?.email, pingActivity]);

  useEffect(() => {
    let mounted = true;

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      console.log('AuthContext - Initial session check:', session?.user?.email, 'Loading:', mounted);
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          setUserId(session.user.id);
          localStorage.setItem('userId', session.user.id);
          await syncUserToBackend(session.user);
        }
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('AuthContext - Auth state change:', _event, 'User:', session?.user?.email, 'Loading:', mounted);
      if (mounted) {
        if (session?.user) {
          setUser(session.user);
          setUserId(session.user.id);
          localStorage.setItem('userId', session.user.id);
          await syncUserToBackend(session.user);
        } else {
          setUser(null);
          setUserId(null);
          localStorage.removeItem('token');
          localStorage.removeItem('userId');
        }
        setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [syncUserToBackend]);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    } else {
      setUser(null);
      setUserId(null);
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
    }
  }, []);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    userId,
    loading,
    signOut,
    supabase
  }), [user, userId, loading, signOut]);

  return (
    <AuthContext.Provider value={value}>
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
