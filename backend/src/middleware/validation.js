// middleware/validation.js
const validateRegister = (req, res, next) => {
  const { email, password, name } = req.body;
  
  const errors = [];
  
  // Email validation
  if (!email || !email.trim()) {
    errors.push('Email is required');
  } else if (!/\S+@\S+\.\S+/.test(email)) {
    errors.push('Please enter a valid email address');
  }
  
  // Password validation
  if (!password || !password.trim()) {
    errors.push('Password is required');
  } else if (password.length < 6) {
    errors.push('Password must be at least 6 characters long');
  }
  
  // Name validation
  if (!name || !name.trim()) {
    errors.push('Name is required');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(', ')
    });
  }
  
  next();
};

const validateLogin = (req, res, next) => {
  const { email, password } = req.body;
  
  const errors = [];
  
  if (!email || !email.trim()) {
    errors.push('Email is required');
  }
  
  if (!password || !password.trim()) {
    errors.push('Password is required');
  }
  
  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      error: errors.join(', ')
    });
  }
  
  next();
};

module.exports = { validateRegister, validateLogin };