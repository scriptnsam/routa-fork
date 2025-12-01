const prisma = require('../config/db');

// @desc    Register driver profile
// @route   POST /api/drivers/register
const registerDriver = async (req, res) => {
  try {
    const { vehicleType, vehiclePlate, licenseNumber } = req.body;
    const userId = req.user.userId;

    // Check if user exists and is a driver
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.role !== 'DRIVER') {
      return res.status(400).json({ message: 'User is not registered as a driver' });
    }

    // Check if driver profile already exists
    const existingDriver = await prisma.driver.findUnique({
      where: { userId },
    });

    if (existingDriver) {
      return res.status(400).json({ message: 'Driver profile already exists' });
    }

    // Create driver profile
    const driver = await prisma.driver.create({
      data: {
        userId,
        vehicleType,
        vehiclePlate,
        licenseNumber,
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    res.status(201).json({
      message: 'Driver profile created successfully',
      driver,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get driver profile
// @route   GET /api/drivers/profile
const getDriverProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const driver = await prisma.driver.findUnique({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    if (!driver) {
      return res.status(404).json({ message: 'Driver profile not found' });
    }

    res.json(driver);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update driver availability
// @route   PATCH /api/drivers/availability
const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const userId = req.user.userId;

    const driver = await prisma.driver.update({
      where: { userId },
      data: { isAvailable },
    });

    res.json({
      message: `You are now ${isAvailable ? 'online' : 'offline'}`,
      isAvailable: driver.isAvailable,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update driver location
// @route   PATCH /api/drivers/location
const updateLocation = async (req, res) => {
  try {
    const { lat, lng } = req.body;
    const userId = req.user.userId;

    const driver = await prisma.driver.update({
      where: { userId },
      data: {
        currentLat: lat,
        currentLng: lng,
      },
    });

    res.json({
      message: 'Location updated',
      location: {
        lat: driver.currentLat,
        lng: driver.currentLng,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get all available drivers
// @route   GET /api/drivers/available
const getAvailableDrivers = async (req, res) => {
  try {
    const drivers = await prisma.driver.findMany({
      where: {
        isAvailable: true,
        isApproved: true,
      },
      include: {
        user: {
          select: {
            firstName: true,
            lastName: true,
            phone: true,
          },
        },
      },
    });

    res.json(drivers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  registerDriver,
  getDriverProfile,
  updateAvailability,
  updateLocation,
  getAvailableDrivers,
};