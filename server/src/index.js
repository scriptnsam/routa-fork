const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    methods: ['GET', 'POST']
  }
});

// Store active drivers
const activeDrivers = new Map();

// Store active orders
const activeOrders = new Map();

io.on('connection', (socket) => {
  const { userId, userRole } = socket.handshake.auth;
  console.log(`✅ User connected: ${userId} (${userRole}) - Socket: ${socket.id}`);

  // ==================== DRIVER EVENTS ====================

  // Driver goes online
  socket.on('driver:available', (data) => {
    activeDrivers.set(data.driverId, {
      socketId: socket.id,
      location: data.location,
      status: 'available',
      timestamp: data.timestamp
    });
    console.log(`🚗 Driver ${data.driverId} is now ONLINE`);
    console.log(`📊 Active drivers: ${activeDrivers.size}`);
  });

  // Driver goes offline
  socket.on('driver:unavailable', (data) => {
    activeDrivers.delete(data.driverId);
    console.log(`🚗 Driver ${data.driverId} is now OFFLINE`);
    console.log(`📊 Active drivers: ${activeDrivers.size}`);
  });

  // Driver location update
  socket.on('driver:location-update', (data) => {
    const driver = activeDrivers.get(data.driverId);
    if (driver) {
      driver.location = data.location;
      driver.timestamp = data.timestamp;
      
      // If driver has an active order, notify the customer
      if (driver.currentOrder) {
        io.to(`order:${driver.currentOrder}`).emit('driver:location', {
          driverId: data.driverId,
          location: data.location,
          timestamp: data.timestamp
        });
      }
    }
  });

  // ==================== ORDER EVENTS ====================

  // New order created
  socket.on('order:create', (order) => {
    console.log(`📦 New order created: ${order.id}`);
    
    // Store the order
    activeOrders.set(order.id, {
      ...order,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    // Join the customer to the order room
    socket.join(`order:${order.id}`);

    // Find nearby available drivers and send them the order
    let notifiedDrivers = 0;
    activeDrivers.forEach((driver, driverId) => {
      if (driver.status === 'available') {
        io.to(driver.socketId).emit('order:new', order);
        notifiedDrivers++;
      }
    });

    console.log(`📤 Order sent to ${notifiedDrivers} available drivers`);
  });

  // Driver accepts order
  socket.on('order:accept', (data) => {
    const { orderId, driverId } = data;
    const driver = activeDrivers.get(driverId);
    const order = activeOrders.get(orderId);

    if (driver && order) {
      // Update driver status
      driver.status = 'busy';
      driver.currentOrder = orderId;

      // Update order status
      order.status = 'accepted';
      order.driverId = driverId;
      order.acceptedAt = new Date().toISOString();

      // Notify customer that order was accepted
      io.to(`order:${orderId}`).emit('order:update', {
        orderId,
        status: 'accepted',
        driverId,
        driverLocation: driver.location
      });

      // Notify other drivers to remove this order from their list
      activeDrivers.forEach((d, id) => {
        if (id !== driverId && d.status === 'available') {
          io.to(d.socketId).emit('order:taken', { orderId });
        }
      });

      // Join driver to order room for updates
      socket.join(`order:${orderId}`);

      console.log(`✅ Order ${orderId} accepted by driver ${driverId}`);
    }
  });

  // Driver rejects order
  socket.on('order:reject', (data) => {
    console.log(`❌ Driver ${data.driverId} rejected order ${data.orderId}`);
    // Could implement logic to track rejections or find another driver
  });

  // Order status update
  socket.on('order:status-update', (data) => {
    const { orderId, status } = data;
    const order = activeOrders.get(orderId);

    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();

      // Notify everyone in the order room (customer + driver)
      io.to(`order:${orderId}`).emit('order:update', {
        orderId,
        status,
        updatedAt: order.updatedAt
      });

      console.log(`📝 Order ${orderId} status updated to: ${status}`);

      // If delivered, free up the driver
      if (status === 'delivered') {
        activeDrivers.forEach((driver, driverId) => {
          if (driver.currentOrder === orderId) {
            driver.status = 'available';
            driver.currentOrder = null;
            console.log(`🚗 Driver ${driverId} is now available again`);
          }
        });

        // Remove order from active orders after some time
        setTimeout(() => {
          activeOrders.delete(orderId);
        }, 60000); // Keep for 1 minute for reference
      }
    }
  });

  // Customer subscribes to order updates
  socket.on('order:subscribe', (data) => {
    socket.join(`order:${data.orderId}`);
    console.log(`👁️ User subscribed to order: ${data.orderId}`);
  });

  // Customer unsubscribes from order updates
  socket.on('order:unsubscribe', (data) => {
    socket.leave(`order:${data.orderId}`);
    console.log(`👁️ User unsubscribed from order: ${data.orderId}`);
  });

  // ==================== DISCONNECT ====================

  socket.on('disconnect', () => {
    // Remove driver from active pool if they disconnect
    activeDrivers.forEach((driver, driverId) => {
      if (driver.socketId === socket.id) {
        activeDrivers.delete(driverId);
        console.log(`🚗 Driver ${driverId} disconnected and removed from pool`);
      }
    });
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

// ==================== REST API ENDPOINTS ====================

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Routa Socket Server is running',
    activeDrivers: activeDrivers.size,
    activeOrders: activeOrders.size
  });
});

// Get active drivers (for admin/debugging)
app.get('/api/drivers', (req, res) => {
  const drivers = [];
  activeDrivers.forEach((driver, id) => {
    drivers.push({ id, ...driver });
  });
  res.json(drivers);
});

// Get active orders (for admin/debugging)
app.get('/api/orders', (req, res) => {
  const orders = [];
  