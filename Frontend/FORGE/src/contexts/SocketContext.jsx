import { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const socketRef = useRef(null);
  const isConnectingRef = useRef(false);
  const userIdRef = useRef(null);

  const cleanupSocket = useCallback(() => {
    if (socketRef.current) {
      console.log('SocketProvider: Cleaning up socket connection');
      // Remove all event listeners before disconnecting
      socketRef.current.removeAllListeners();
      socketRef.current.disconnect();
      socketRef.current = null;
      setSocket(null);
      setIsConnected(false);
      isConnectingRef.current = false;
    }
  }, []);

  useEffect(() => {
    // Get user ID from various possible locations
    const userId = user?.user_metadata?.uid || user?.email || user?.id;
    
    // Only connect if user is authenticated
    if (!userId) {
      console.log('SocketProvider: No user ID, skipping connection');
      if (socketRef.current) {
        cleanupSocket();
      }
      return;
    }

    // Prevent duplicate connections for the same user
    if (socketRef.current && userIdRef.current === userId) {
      console.log('SocketProvider: Socket already exists for this user, skipping connection');
      return;
    }

    // If user changed, cleanup old socket first
    if (socketRef.current && userIdRef.current !== userId) {
      console.log('SocketProvider: User changed, cleaning up old socket');
      cleanupSocket();
    }

    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current) {
      console.log('SocketProvider: Connection already in progress, skipping');
      return;
    }

    console.log('SocketProvider: Attempting to connect socket for user:', userId);
    userIdRef.current = userId;
    isConnectingRef.current = true;

    // Initialize socket connection
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:5000', {
      withCredentials: true,
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionDelay: 2000,
      reconnectionAttempts: 10,
      timeout: 30000,
      // Remove forceNew to allow Socket.io to manage connection reuse
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
      isConnectingRef.current = false;
      
      // Join with user ID
      socketInstance.emit('user:join', userId);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      isConnectingRef.current = false;
    });

    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
      isConnectingRef.current = false;
    });

    socketRef.current = socketInstance;
    setSocket(socketInstance);

    // Cleanup on unmount or user change
    return () => {
      console.log('SocketProvider: Cleanup function called');
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
    // Return default values to prevent crashes during lazy loading
    console.warn('useSocket must be used within a SocketProvider. Returning default values.');
    return {
      socket: null,
      isConnected: false,
      joinConnection: () => {},
      leaveConnection: () => {},
      sendMessage: () => {}
    };
  }
  return context;
};