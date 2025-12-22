import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId, userRole) {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    
    if (this.socket && this.isConnected) {
      console.log('Socket already connected');
      return this.socket;
    }

    try {
      this.socket = io(SOCKET_URL, {
        auth: {
          userId,
          userRole
        },
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
      });

      this.socket.on('connect', () => {
        this.isConnected = true;
        console.log('Socket connected:', this.socket.id);
      });

      this.socket.on('disconnect', (reason) => {
        this.isConnected = false;
        console.log('Socket disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        this.isConnected = false;
        console.error('Socket connection error:', error.message);
      });

      return this.socket;
    } catch (error) {
      console.error('Failed to create socket connection:', error);
      return null;
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Driver joins available pool
  joinDriverPool(driverId, location) {
    if (this.socket) {
      this.socket.emit('driver:available', {
        driverId,
        location,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Driver leaves available pool
  leaveDriverPool(driverId) {
    if (this.socket) {
      this.socket.emit('driver:unavailable', { driverId });
    }
  }

  // Update driver location
  updateDriverLocation(driverId, location) {
    if (this.socket) {
      this.socket.emit('driver:location-update', {
        driverId,
        location,
        timestamp: new Date().toISOString()
      });
    }
  }

  // Create new order
  createOrder(order) {
    if (this.socket) {
      this.socket.emit('order:create', order);
    }
  }

  // Driver accepts order
  acceptOrder(orderId, driverId) {
    if (this.socket) {
      this.socket.emit('order:accept', { orderId, driverId });
    }
  }

  // Driver rejects order
  rejectOrder(orderId, driverId) {
    if (this.socket) {
      this.socket.emit('order:reject', { orderId, driverId });
    }
  }

  // Update order status
  updateOrderStatus(orderId, status) {
    if (this.socket) {
      this.socket.emit('order:status-update', { orderId, status });
    }
  }

  // Subscribe to order updates
  subscribeToOrder(orderId) {
    if (this.socket) {
      this.socket.emit('order:subscribe', { orderId });
    }
  }

  // Unsubscribe from order updates
  unsubscribeFromOrder(orderId) {
    if (this.socket) {
      this.socket.emit('order:unsubscribe', { orderId });
    }
  }

  // Listen for new orders (drivers)
  onNewOrder(callback) {
    if (this.socket) {
      this.socket.off('order:new');
      this.socket.on('order:new', callback);
    }
  }

  // Listen for order taken by another driver
  onOrderTaken(callback) {
    if (this.socket) {
      this.socket.off('order:taken');
      this.socket.on('order:taken', callback);
    }
  }

  // Listen for order updates
  onOrderUpdate(callback) {
    if (this.socket) {
      this.socket.off('order:update');
      this.socket.on('order:update', callback);
    }
  }

  // Listen for driver location updates
  onDriverLocationUpdate(callback) {
    if (this.socket) {
      this.socket.off('driver:location');
      this.socket.on('driver:location', callback);
    }
  }

  // Remove specific listener
  removeListener(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }

  // Remove all listeners
  removeAllListeners() {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }
}

const socketService = new SocketService();

export default socketService;