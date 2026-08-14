/* Express router for AI API endpoints (/api/ai/*) */
const express = require('express');
const router = express.Router();
const aiController = require('../controllers/aiController');
const { optionalAuth } = require('../middleware/auth');

// Image Analysis & Vision Recommendation
router.post('/analyze-image', optionalAuth, aiController.analyzeImage);

module.exports = router;
