// middleware/errorHandler.js - Global error handling middleware
const errorHandler = (error, req, res, next) => {
  console.error('Error:', error);
  
  const statusCode = error.statusCode || 500;
  const message = error.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    error: {
      name: error.name || 'Error',
      message: message,
      statusCode: statusCode,
      timestamp: new Date().toISOString()
    }
  });
};

module.exports = {
  errorHandler
};