const express = require('express');
const router = express.Router();
const {
  registerDriver,
  getDriverProfile,
  updateAvailability,
  updateLocation,
  getAvailableDrivers,
} = require('../controllers/driverController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.post('/register', protect, authorize('DRIVER'), registerDriver);
router.get('/profile', protect, authorize('DRIVER'), getDriverProfile);
router.patch('/availability', protect, authorize('DRIVER'), updateAvailability);
router.patch('/location', protect, authorize('DRIVER'), updateLocation);
router.get('/available', protect, getAvailableDrivers);

module.exports = router;