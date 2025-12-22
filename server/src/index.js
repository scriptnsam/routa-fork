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
  console.log(`User connected: ${userId} (${userRole}) - Socket: ${socket.id}`);

  // Driver goes online
  socket.on('driver:available', (data) => {
    activeDrivers.set(data.driverId, {
      socketId: socket.id,
      location: data.location,
      status: 'available',
      timestamp: data.timestamp
    });
    console.log(`Driver ${data.driverId} is now ONLINE`);
    console.log(`Active drivers: ${activeDrivers.size}`);
  });

  // Driver goes offline
  socket.on('driver:unavailable', (data) => {
    activeDrivers.delete(data.driverId);
    console.log(`Driver ${data.driverId} is now OFFLINE`);
  });

  // Driver location update
  socket.on('driver:location-update', (data) => {
    const driver = activeDrivers.get(data.driverId);
    if (driver) {
      driver.location = data.location;
      driver.timestamp = data.timestamp;
      
      if (driver.currentOrder) {
        io.to(`order:${driver.currentOrder}`).emit('driver:location', {
          driverId: data.driverId,
          location: data.location,
          timestamp: data.timestamp
        });
      }
    }
  });

  // New order created
  socket.on('order:create', (order) => {
    console.log(`New order created: ${order.id}`);
    
    activeOrders.set(order.id, {
      ...order,
      status: 'pending',
      createdAt: new Date().toISOString()
    });

    socket.join(`order:${order.id}`);

    let notifiedDrivers = 0;
    activeDrivers.forEach((driver, driverId) => {
      if (driver.status === 'available') {
        io.to(driver.socketId).emit('order:new', order);
        notifiedDrivers++;
      }
    });

    console.log(`Order sent to ${notifiedDrivers} available drivers`);
  });

  // Driver accepts order
  socket.on('order:accept', (data) => {
    const { orderId, driverId } = data;
    const driver = activeDrivers.get(driverId);
    const order = activeOrders.get(orderId);

    if (driver && order) {
      driver.status = 'busy';
      driver.currentOrder = orderId;

      order.status = 'accepted';
      order.driverId = driverId;
      order.acceptedAt = new Date().toISOString();

      io.to(`order:${orderId}`).emit('order:update', {
        orderId,
        status: 'accepted',
        driverId,
        driverLocation: driver.location
      });

      activeDrivers.forEach((d, id) => {
        if (id !== driverId && d.status === 'available') {
          io.to(d.socketId).emit('order:taken', { orderId });
        }
      });

      socket.join(`order:${orderId}`);
      console.log(`Order ${orderId} accepted by driver ${driverId}`);
    }
  });

  // Driver rejects order
  socket.on('order:reject', (data) => {
    console.log(`Driver ${data.driverId} rejected order ${data.orderId}`);
  });

  // Order status update
  socket.on('order:status-update', (data) => {
    const { orderId, status } = data;
    const order = activeOrders.get(orderId);

    if (order) {
      order.status = status;
      order.updatedAt = new Date().toISOString();

      io.to(`order:${orderId}`).emit('order:update', {
        orderId,
        status,
        updatedAt: order.updatedAt
      });

      console.log(`Order ${orderId} status updated to: ${status}`);

      if (status === 'delivered') {
        activeDrivers.forEach((driver, driverId) => {
          if (driver.currentOrder === orderId) {
            driver.status = 'available';
            driver.currentOrder = null;
            console.log(`Driver ${driverId} is now available again`);
          }
        });

        setTimeout(() => {
          activeOrders.delete(orderId);
        }, 60000);
      }
    }
  });

  // Customer subscribes to order updates
  socket.on('order:subscribe', (data) => {
    socket.join(`order:${data.orderId}`);
    console.log(`User subscribed to order: ${data.orderId}`);
  });

  // Customer unsubscribes from order updates
  socket.on('order:unsubscribe', (data) => {
    socket.leave(`order:${data.orderId}`);
  });

  // Disconnect
  socket.on('disconnect', () => {
    activeDrivers.forEach((driver, driverId) => {
      if (driver.socketId === socket.id) {
        activeDrivers.delete(driverId);
        console.log(`Driver ${driverId} disconnected`);
      }
    });
    console.log(`User disconnected: ${socket.id}`);
  });
});

// REST API Endpoints
app.get('/', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'Routa Socket Server is running',
    activeDrivers: activeDrivers.size,
    activeOrders: activeOrders.size
  });
});

app.get('/api/drivers', (req, res) => {
  const drivers = [];
  activeDrivers.forEach((driver, id) => {
    drivers.push({ id, ...driver });
  });
  res.json(drivers);
});

app.get('/api/orders', (req, res) => {
  const orders = [];
  activeOrders.forEach((order, id) => {
    orders.push({ id, ...order });
  });
  res.json(orders);
});

// Start Server
const PORT = process.env.PORT || 3001;

server.listen(PORT, () => {
  console.log('');
  console.log('=================================');
  console.log('  Routa Socket Server Running!');
  console.log('=================================');
  console.log(`  URL: http://localhost:${PORT}`);
  console.log('  Waiting for connections...');
  console.log('=================================');
  console.log('');
});