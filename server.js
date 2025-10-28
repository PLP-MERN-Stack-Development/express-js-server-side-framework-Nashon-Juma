// server.js - Complete Express server for Week 2 assignment

// Import required modules
const express = require('express');
const bodyParser = require('body-parser');
const { v4: uuidv4 } = require('uuid');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Custom Error Classes
class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
    this.statusCode = 404;
  }
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.statusCode = 400;
  }
}

class AuthenticationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AuthenticationError';
    this.statusCode = 401;
  }
}

// Middleware setup
app.use(bodyParser.json());

// Custom Logger Middleware
const loggerMiddleware = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

app.use(loggerMiddleware);

// Authentication Middleware
const authMiddleware = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  
  // For demo purposes, using a simple API key check
  // In production, use environment variables and more secure authentication
  const validApiKey = process.env.API_KEY || 'demo-api-key-123';
  
  if (!apiKey || apiKey !== validApiKey) {
    return next(new AuthenticationError('Invalid or missing API key'));
  }
  
  next();
};

// Validation Middleware for Product Creation/Update
const validateProduct = (req, res, next) => {
  const { name, description, price, category } = req.body;
  
  if (!name || typeof name !== 'string' || name.trim() === '') {
    return next(new ValidationError('Product name is required and must be a non-empty string'));
  }
  
  if (!description || typeof description !== 'string' || description.trim() === '') {
    return next(new ValidationError('Product description is required and must be a non-empty string'));
  }
  
  if (price === undefined || typeof price !== 'number' || price < 0) {
    return next(new ValidationError('Product price is required and must be a non-negative number'));
  }
  
  if (!category || typeof category !== 'string' || category.trim() === '') {
    return next(new ValidationError('Product category is required and must be a non-empty string'));
  }
  
  next();
};

// Sample in-memory products database
let products = [
  {
    id: '1',
    name: 'Laptop',
    description: 'High-performance laptop with 16GB RAM',
    price: 1200,
    category: 'electronics',
    inStock: true
  },
  {
    id: '2',
    name: 'Smartphone',
    description: 'Latest model with 128GB storage',
    price: 800,
    category: 'electronics',
    inStock: true
  },
  {
    id: '3',
    name: 'Coffee Maker',
    description: 'Programmable coffee maker with timer',
    price: 50,
    category: 'kitchen',
    inStock: false
  }
];

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! Go to /api/products to see all products.');
});

// GET /api/products - Get all products with filtering, pagination, and search
app.get('/api/products', (req, res, next) => {
  try {
    let filteredProducts = [...products];
    
    // Filter by category
    if (req.query.category) {
      filteredProducts = filteredProducts.filter(
        product => product.category.toLowerCase() === req.query.category.toLowerCase()
      );
    }
    
    // Filter by inStock status
    if (req.query.inStock) {
      const inStock = req.query.inStock.toLowerCase() === 'true';
      filteredProducts = filteredProducts.filter(product => product.inStock === inStock);
    }
    
    // Search by name
    if (req.query.search) {
      const searchTerm = req.query.search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
    
    const response = {
      page,
      limit,
      total: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / limit),
      hasNext: endIndex < filteredProducts.length,
      hasPrev: page > 1,
      data: paginatedProducts
    };
    
    res.json(response);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/search - Search products by name or description
app.get('/api/products/search', (req, res, next) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return next(new ValidationError('Search query parameter "q" is required'));
    }
    
    const searchTerm = q.toLowerCase();
    const searchResults = products.filter(product =>
      product.name.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm)
    );
    
    res.json({
      query: q,
      results: searchResults,
      count: searchResults.length
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/products/stats - Get product statistics
app.get('/api/products/stats', (req, res, next) => {
  try {
    const stats = {
      totalProducts: products.length,
      totalInStock: products.filter(p => p.inStock).length,
      totalOutOfStock: products.filter(p => !p.inStock).length,
      categories: {},
      priceStats: {
        min: Math.min(...products.map(p => p.price)),
        max: Math.max(...products.map(p => p.price)),
        avg: products.reduce((sum, p) => sum + p.price, 0) / products.length
      }
    };
    
    // Count by category
    products.forEach(product => {
      if (!stats.categories[product.category]) {
        stats.categories[product.category] = 0;
      }
      stats.categories[product.category]++;
    });
    
    res.json(stats);
  } catch (error) {
    next(error);
  }
});

// GET /api/products/:id - Get a specific product by ID
app.get('/api/products/:id', (req, res, next) => {
  try {
    const product = products.find(p => p.id === req.params.id);
    
    if (!product) {
      throw new NotFoundError(`Product with ID ${req.params.id} not found`);
    }
    
    res.json(product);
  } catch (error) {
    next(error);
  }
});

// POST /api/products - Create a new product (with authentication and validation)
app.post('/api/products', authMiddleware, validateProduct, (req, res, next) => {
  try {
    const { name, description, price, category, inStock = true } = req.body;
    
    const newProduct = {
      id: uuidv4(),
      name: name.trim(),
      description: description.trim(),
      price,
      category: category.trim(),
      inStock: Boolean(inStock)
    };
    
    products.push(newProduct);
    
    res.status(201).json({
      message: 'Product created successfully',
      product: newProduct
    });
  } catch (error) {
    next(error);
  }
});

// PUT /api/products/:id - Update an existing product (with authentication and validation)
app.put('/api/products/:id', authMiddleware, validateProduct, (req, res, next) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      throw new NotFoundError(`Product with ID ${req.params.id} not found`);
    }
    
    const { name, description, price, category, inStock } = req.body;
    
    const updatedProduct = {
      ...products[productIndex],
      name: name.trim(),
      description: description.trim(),
      price,
      category: category.trim(),
      inStock: Boolean(inStock)
    };
    
    products[productIndex] = updatedProduct;
    
    res.json({
      message: 'Product updated successfully',
      product: updatedProduct
    });
  } catch (error) {
    next(error);
  }
});

// DELETE /api/products/:id - Delete a product (with authentication)
app.delete('/api/products/:id', authMiddleware, (req, res, next) => {
  try {
    const productIndex = products.findIndex(p => p.id === req.params.id);
    
    if (productIndex === -1) {
      throw new NotFoundError(`Product with ID ${req.params.id} not found`);
    }
    
    const deletedProduct = products.splice(productIndex, 1)[0];
    
    res.json({
      message: 'Product deleted successfully',
      product: deletedProduct
    });
  } catch (error) {
    next(error);
  }
});

// Global Error Handling Middleware
app.use((error, req, res, next) => {
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
});

// 404 Handler for undefined routes - FIXED VERSION
app.use((req, res, next) => {
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

// Export the app for testing purposes
module.exports = app;