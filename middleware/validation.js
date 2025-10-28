// middleware/validation.js - Validation middleware
const { ValidationError } = require('../models/Product');

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

module.exports = {
  validateProduct
};