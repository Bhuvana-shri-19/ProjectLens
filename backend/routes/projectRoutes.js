const express = require('express');
const router = express.Router();
const {
  analyzeProject,
  getProjects,
  getProjectById,
  deleteProject,
} = require('../controllers/projectController');
const { protect } = require('../middleware/authMiddleware');

// All project operations require an authenticated user.
router.use(protect);

router.post('/analyze', analyzeProject);
router.get('/', getProjects);
router.get('/:id', getProjectById);
router.delete('/:id', deleteProject);

module.exports = router;
