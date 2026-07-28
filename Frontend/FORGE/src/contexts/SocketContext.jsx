import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const connectionAttemptsRef = useRef(0);
  const MAX_CONNECTION_ATTEMPTS = 3;

  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      // Remove all event listeners before disconnecting
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
    }
  }, []);

  useEffect(() => {
    // Get user ID from various possible locations
    const userId = user?.user_metadata?.uid || user?.email || user?.id;
    
    // Only connect if user is authenticated and we haven't exceeded max attempts
    if (!userId || connectionAttemptsRef.current >= MAX_CONNECTION_ATTEMPTS) {
      return;
    }

    // Prevent duplicate connections
    if (socketRef.current) {
      return;
    }

    connectionAttemptsRef.current++;

    // Initialize socket connection
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 3,
      timeout: 10000,
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      connectionAttemptsRef.current = 0; // Reset on successful connection
      
      // Join with user ID
      socketInstance.emit('user:join', userId);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      
      // If max attempts reached, stop trying
      if (connectionAttemptsRef.current >= MAX_CONNECTION_ATTEMPTS) {
        console.log('Max connection attempts reached, stopping reconnection');
        cleanupSocket();
      }
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // Cleanup on unmount or user change
    return () => {
      cleanupSocket();
    };
  }, [user, cleanupSocket]);

  const joinConnection = useCallback((connectionId) => {
    if (socket && isConnected) {
      socket.emit('join:connection', connectionId);
    }
  }, [socket, isConnected]);

  const leaveConnection = useCallback((connectionId) => {
    if (socket && isConnected) {
      socket.emit('leave:connection', connectionId);
    }
  }, [socket, isConnected]);

  const sendMessage = useCallback((connectionId, message) => {
    if (socket && isConnected) {
      socket.emit('message:send', { connectionId, message });
    }
  }, [socket, isConnected]);

  const value = {
    socket,
    isConnected,
    joinConnection,
    leaveConnection,
    sendMessage
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
