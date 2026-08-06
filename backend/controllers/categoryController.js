/* BlogAuth V1 controllers/categoryController.js — Category Controller */
const { Category } = require('../models');
const catchAsync = require('../utils/catchAsync');

const listCategories = catchAsync(async (req, res, next) => {
  const categories = await Category.find({});
  res.status(200).json({
    success: true,
    results: categories
  });
});

module.exports = {
  listCategories
};
