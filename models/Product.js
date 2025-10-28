// models/Product.js - Product model and in-memory database
const { v4: uuidv4 } = require('uuid');

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

// Product model methods
const Product = {
  // Get all products with optional filtering
  findAll(filters = {}) {
    let filteredProducts = [...products];
    
    // Filter by category
    if (filters.category) {
      filteredProducts = filteredProducts.filter(
        product => product.category.toLowerCase() === filters.category.toLowerCase()
      );
    }
    
    // Filter by inStock status
    if (filters.inStock !== undefined) {
      filteredProducts = filteredProducts.filter(
        product => product.inStock === filters.inStock
      );
    }
    
    // Search by name or description
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredProducts = filteredProducts.filter(product =>
        product.name.toLowerCase().includes(searchTerm) ||
        product.description.toLowerCase().includes(searchTerm)
      );
    }
    
    return filteredProducts;
  },

  // Find product by ID
  findById(id) {
    const product = products.find(p => p.id === id);
    if (!product) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }
    return product;
  },

  // Create new product
  create(productData) {
    const newProduct = {
      id: uuidv4(),
      name: productData.name.trim(),
      description: productData.description.trim(),
      price: productData.price,
      category: productData.category.trim(),
      inStock: Boolean(productData.inStock)
    };
    
    products.push(newProduct);
    return newProduct;
  },

  // Update existing product
  update(id, productData) {
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }
    
    const updatedProduct = {
      ...products[productIndex],
      name: productData.name.trim(),
      description: productData.description.trim(),
      price: productData.price,
      category: productData.category.trim(),
      inStock: Boolean(productData.inStock)
    };
    
    products[productIndex] = updatedProduct;
    return updatedProduct;
  },

  // Delete product
  delete(id) {
    const productIndex = products.findIndex(p => p.id === id);
    
    if (productIndex === -1) {
      throw new NotFoundError(`Product with ID ${id} not found`);
    }
    
    return products.splice(productIndex, 1)[0];
  },

  // Get product statistics
  getStats() {
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
    
    return stats;
  }
};

module.exports = {
  Product,
  NotFoundError,
  ValidationError,
  AuthenticationError
};