const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: 'http://localhost:5173',
      methods: ['GET', 'POST'],
    },
  });

  // Authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    
    if (!token) {
      return next(new Error('Authentication error'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join personal room
    socket.join(socket.userId);

    // Driver joins driver room
    socket.on('driver:online', (driverId) => {
      socket.join('drivers');
      socket.join(`driver:${driverId}`);
      console.log(`Driver online: ${driverId}`);
    });

    // Driver goes offline
    socket.on('driver:offline', (driverId) => {
      socket.leave('drivers');
      socket.leave(`driver:${driverId}`);
      console.log(`Driver offline: ${driverId}`);
    });

    // Driver location update
    socket.on('driver:location', (data) => {
      const { orderId, lat, lng } = data;
      // Emit to customer tracking this order
      io.to(`order:${orderId}`).emit('location:update', { lat, lng });
    });

    // Customer joins order room for tracking
    socket.on('order:track', (orderId) => {
      socket.join(`order:${orderId}`);
      console.log(`User tracking order: ${orderId}`);
    });

    // Stop tracking order
    socket.on('order:untrack', (orderId) => {
      socket.leave(`order:${orderId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error('Socket.io not initialized');
  }
  return io;
};

// Emit to specific user
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(userId).emit(event, data);
  }
};

// Emit to all drivers
const emitToDrivers = (event, data) => {
  if (io) {
    io.to('drivers').emit(event, data);
  }
};

// Emit to order room
const emitToOrder = (orderId, event, data) => {
  if (io) {
    io.to(`order:${orderId}`).emit(event, data);
  }
};

module.exports = {
  initSocket,
  getIO,
  emitToUser,
  emitToDrivers,
  emitToOrder,
};