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
  const [isVerified, setIsVerified] = useState(false);
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

      if (response.data.accessToken) {
        localStorage.setItem('token', response.data.accessToken);
        console.log('AuthContext - Access token stored successfully');
      } else if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('AuthContext - Legacy token stored successfully');
      }

      // Fetch verification status - don't block auth flow if this fails
      try {
        const verificationResponse = await axios.get(`/api/auth/verification-status/email/${user.email}`);
        setIsVerified(verificationResponse.data.is_verified);
      } catch (error) {
        console.log('Verification status endpoint not available yet, defaulting to false');
        setIsVerified(false);
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

    const ACTIVITY_PING_INTERVAL = 5 * 60 * 1000; // 5 minutes (increased from 2 minutes)
    let intervalId = null;
    let activityTimeout = null;

    // Initial ping
    pingActivity(user.email);

    // Set up interval for activity pings
    intervalId = setInterval(() => {
      pingActivity(user.email);
    }, ACTIVITY_PING_INTERVAL);

    // Track user interactions with debouncing to reduce network calls
    const handleUserActivity = () => {
      // Clear existing timeout
      if (activityTimeout) {
        clearTimeout(activityTimeout);
      }
      
      // Debounce: only ping after 2 seconds of inactivity
      activityTimeout = setTimeout(() => {
        pingActivity(user.email);
      }, 2000);
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
      if (activityTimeout) {
        clearTimeout(activityTimeout);
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

  const refreshUser = useCallback(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser(session.user);
        setUserId(session.user.id);
        localStorage.setItem('userId', session.user.id);
        await syncUserToBackend(session.user);
        
        // Fetch verification status - don't block if this fails
        try {
          const verificationResponse = await axios.get(`/api/auth/verification-status/email/${session.user.email}`);
          setIsVerified(verificationResponse.data.is_verified);
        } catch (error) {
          console.log('Verification status endpoint not available yet, defaulting to false');
          setIsVerified(false);
        }
      }
    } catch (error) {
      console.error('Error refreshing user:', error);
    }
  }, [syncUserToBackend]);

  // Memoize context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    userId,
    isVerified,
    loading,
    signOut,
    refreshUser,
    supabase
  }), [user, userId, isVerified, loading, signOut, refreshUser]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    // Instead of throwing, return default values to prevent crashes during lazy loading
    console.warn('useAuth must be used within an AuthProvider. Returning default values.');
    return {
      user: null,
      userId: null,
      isVerified: false,
      loading: true,
      signOut: async () => {},
      refreshUser: async () => {},
      supabase: null
    };
  }
  return context;
};
