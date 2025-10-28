// server.js - Main server file
const express = require('express');
const bodyParser = require('body-parser');

// Import routes and middleware
const productRoutes = require('./routes/products');
const { loggerMiddleware } = require('./middleware/logger');
const { errorHandler } = require('./middleware/errorHandler');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware setup
app.use(bodyParser.json());
app.use(loggerMiddleware);

// Routes
app.use('/api/products', productRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 Handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: `Route ${req.originalUrl} not found`,
      statusCode: 404,
      timestamp: new Date().toISOString()
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

module.exports = app;