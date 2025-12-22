import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem('token');
      
      const newSocket = io(import.meta.env.VITE_BASE_URL, {
        auth: { token },
      });

      newSocket.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      newSocket.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      newSocket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    } else {
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated]);

  // Driver goes online
  const goOnline = (driverId) => {
    if (socket) {
      socket.emit('driver:online', driverId);
    }
  };

  // Driver goes offline
  const goOffline = (driverId) => {
    if (socket) {
      socket.emit('driver:offline', driverId);
    }
  };

  // Update driver location
  const updateLocation = (orderId, lat, lng) => {
    if (socket) {
      socket.emit('driver:location', { orderId, lat, lng });
    }
  };

  // Track an order
  const trackOrder = (orderId) => {
    if (socket) {
      socket.emit('order:track', orderId);
    }
  };

  // Stop tracking an order
  const untrackOrder = (orderId) => {
    if (socket) {
      socket.emit('order:untrack', orderId);
    }
  };

  const value = {
    socket,
    isConnected,
    goOnline,
    goOffline,
    updateLocation,
    trackOrder,
    untrackOrder,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};