const express = require('express');
const router = express.Router();
const { analyzeProject } = require('../controllers/projectController');

// POST /api/projects/analyze
router.post('/analyze', analyzeProject);

module.exports = router;
