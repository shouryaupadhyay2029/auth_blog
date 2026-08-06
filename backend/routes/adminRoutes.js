/* BlogAuth V1 routes/adminRoutes.js — Admin Dashboard Routes Configuration */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect);
router.use(authorize('admin')); // Restrict all endpoints to admins only

router.get('/users', adminController.getAllUsers);
router.put('/users/:id/role', adminController.updateUserRole);
router.get('/reports', adminController.getAllReports);
router.put('/reports/:id', adminController.updateReportStatus);

module.exports = router;
