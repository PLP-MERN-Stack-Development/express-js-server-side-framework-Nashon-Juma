// middleware/auth.js - Authentication middleware
const { AuthenticationError } = require('../models/Product');
const { VALID_API_KEY } = require('../config/constants');

const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  if (!apiKey || apiKey !== VALID_API_KEY) {
    return next(new AuthenticationError('Invalid or missing API key'));
  }
  
  next();
};

module.exports = {
  authMiddleware
};