// routes/products.js - Product routes
const express = require('express');
const router = express.Router();

// Import middleware
const { authMiddleware } = require('../middleware/auth');
const { validateProduct } = require('../middleware/validation');

// Import controller
const productsController = require('../controllers/productsController');

// Route definitions
router.get('/', productsController.getAllProducts);
router.get('/search', productsController.searchProducts);
router.get('/stats', productsController.getProductStats);
router.get('/:id', productsController.getProductById);
router.post('/', authMiddleware, validateProduct, productsController.createProduct);
router.put('/:id', authMiddleware, validateProduct, productsController.updateProduct);
router.delete('/:id', authMiddleware, productsController.deleteProduct);

module.exports = router;