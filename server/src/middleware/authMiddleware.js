const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: 'Not authorized, invalid token' });
  }
};

const authorize = (...roles) => {
  return async (req, res, next) => {
    const prisma = require('../config/db');
    
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user || !roles.includes(user.role)) {
      return res.status(403).json({ 
        message: 'Not authorized to access this route' 
      });
    }

    next();
  };
};

module.exports = { protect, authorize };