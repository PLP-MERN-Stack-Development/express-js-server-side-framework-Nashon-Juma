// middleware/logger.js - Custom logger middleware
const loggerMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

module.exports = {
  loggerMiddleware
};