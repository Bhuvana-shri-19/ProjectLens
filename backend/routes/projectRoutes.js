const express = require('express');
const router = express.Router();
const { analyzeProject } = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/projects/analyze — protected: valid JWT required
router.post('/analyze', protect, analyzeProject);

module.exports = router;
