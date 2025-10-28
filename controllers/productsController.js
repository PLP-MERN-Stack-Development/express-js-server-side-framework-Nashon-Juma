// controllers/productsController.js - Product controller functions
const { Product, ValidationError } = require('../models/Product');
const { DEFAULT_PAGE, DEFAULT_PAGE_LIMIT } = require('../config/constants');

const productsController = {
  // Get all products with filtering and pagination
  getAllProducts(req, res, next) {
    try {
      const { category, inStock, search, page, limit } = req.query;
      
      // Build filters object
      const filters = {};
      if (category) filters.category = category;
      if (inStock) filters.inStock = inStock.toLowerCase() === 'true';
      if (search) filters.search = search;
      
      // Get filtered products
      const filteredProducts = Product.findAll(filters);
      
      // Apply pagination
      const pageNum = parseInt(page) || DEFAULT_PAGE;
      const limitNum = parseInt(limit) || DEFAULT_PAGE_LIMIT;
      const startIndex = (pageNum - 1) * limitNum;
      const endIndex = startIndex + limitNum;
      
      const paginatedProducts = filteredProducts.slice(startIndex, endIndex);
      
      const response = {
        page: pageNum,
        limit: limitNum,
        total: filteredProducts.length,
        totalPages: Math.ceil(filteredProducts.length / limitNum),
        hasNext: endIndex < filteredProducts.length,
        hasPrev: pageNum > 1,
        data: paginatedProducts
      };
      
      res.json(response);
    } catch (error) {
      next(error);
    }
  },

  // Search products by name or description
  searchProducts(req, res, next) {
    try {
      const { q } = req.query;
      
      if (!q) {
        throw new ValidationError('Search query parameter "q" is required');
      }
      
      const searchResults = Product.findAll({ search: q });
      
      res.json({
        query: q,
        results: searchResults,
        count: searchResults.length
      });
    } catch (error) {
      next(error);
    }
  },

  // Get product statistics
  getProductStats(req, res, next) {
    try {
      const stats = Product.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  },

  // Get product by ID
  getProductById(req, res, next) {
    try {
      const product = Product.findById(req.params.id);
      res.json(product);
    } catch (error) {
      next(error);
    }
  },

  // Create new product
  createProduct(req, res, next) {
    try {
      const { name, description, price, category, inStock = true } = req.body;
      
      const newProduct = Product.create({
        name,
        description,
        price,
        category,
        inStock
      });
      
      res.status(201).json({
        message: 'Product created successfully',
        product: newProduct
      });
    } catch (error) {
      next(error);
    }
  },

  // Update existing product
  updateProduct(req, res, next) {
    try {
      const { name, description, price, category, inStock } = req.body;
      
      const updatedProduct = Product.update(req.params.id, {
        name,
        description,
        price,
        category,
        inStock
      });
      
      res.json({
        message: 'Product updated successfully',
        product: updatedProduct
      });
    } catch (error) {
      next(error);
    }
  },

  // Delete product
  deleteProduct(req, res, next) {
    try {
      const deletedProduct = Product.delete(req.params.id);
      
      res.json({
        message: 'Product deleted successfully',
        product: deletedProduct
      });
    } catch (error) {
      next(error);
    }
  }
};

module.exports = productsController;