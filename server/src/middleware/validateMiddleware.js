const validateRegister = (req, res, next) => {
  const { email, phone, password, firstName, lastName } = req.body;

  const errors = [];

  if (!email || !email.includes('@')) {
    errors.push('Valid email is required');
  }

  if (!phone || phone.length < 10) {
    errors.push('Valid phone number is required');
  }

  if (!password || password.length < 6) {
    errors.push('Password must be at least 6 characters');
  }

  if (!firstName || !lastName) {
    errors.push('First name and last name are required');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ 
      message: 'Email and password are required' 
    });
  }

  next();
};

module.exports = { validateRegister, validateLogin };