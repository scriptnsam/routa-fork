import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.listeners = new Map();
  }

  connect(userId, userRole) {
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';
    
    this.socket = io(SOCKET_URL, {
      auth: {
        userId,
        userRole
      },
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Socket connected:', this.socket.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
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

  // Listen for new orders (drivers)
  onNewOrder(callback) {
    if (this.socket) {
      this.socket.on('order:new', callback);
    }
  }

  // Listen for order taken (remove from list)
  onOrderTaken(callback) {
    if (this.socket) {
      this.socket.on('order:taken', callback);
    }
  }

  // Listen for order updates (customers)
  onOrderUpdate(callback) {
    if (this.socket) {
      this.socket.on('order:update', callback);
    }
  }

  // Listen for driver location updates (customers tracking)
  onDriverLocationUpdate(callback) {
    if (this.socket) {
      this.socket.on('driver:location', callback);
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

  // Subscribe to specific order
  subscribeToOrder(orderId) {
    if (this.socket) {
      this.socket.emit('order:subscribe', { orderId });
    }
  }

  // Unsubscribe from order
  unsubscribeFromOrder(orderId) {
    if (this.socket) {
      this.socket.emit('order:unsubscribe', { orderId });
    }
  }

  // Remove listener
  removeListener(event) {
    if (this.socket) {
      this.socket.off(event);
    }
  }
}

export const socketService = new SocketService();
export default socketService;