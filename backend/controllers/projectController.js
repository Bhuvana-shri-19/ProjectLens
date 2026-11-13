const mongoose = require('mongoose');
const { fetchRepoData } = require('../utils/githubHelper');
const { analyzeWithAI } = require('../utils/aiHelper');
const ProjectResult = require('../models/ProjectResult');

const getRepositoryCoordinates = (githubUrl) => {
  try {
    const parsed = new URL(githubUrl);
    if (parsed.protocol !== 'https:' || parsed.hostname.toLowerCase() !== 'github.com') {
      return null;
    }
    const parts = parsed.pathname.split('/').filter(Boolean);
    if (parts.length < 2) return null;
    return {
      owner: parts[0],
      repo: parts[1].replace(/\.git$/i, ''),
    };
  } catch {
    return null;
  }
};

const analyzeProject = async (req, res) => {
  try {
    const { githubUrl } = req.body || {};
    const repository = typeof githubUrl === 'string'
      ? getRepositoryCoordinates(githubUrl.trim())
      : null;

    if (!repository) {
      return res.status(400).json({
        success: false,
        error: 'Provide a valid public GitHub repository URL (https://github.com/owner/repository).',
      });
    }

    const normalizedUrl = `https://github.com/${repository.owner}/${repository.repo}`;
    const repoData = await fetchRepoData(normalizedUrl);
    const evaluation = await analyzeWithAI(repoData);

    if (!evaluation || typeof evaluation !== 'object') {
      return res.status(502).json({
        success: false,
        error: 'The evaluation service returned an invalid response.',
      });
    }

    const scoreValue = Number(evaluation.impressivenessScore);
    const overallScore = Number.isFinite(scoreValue) && scoreValue >= 0 && scoreValue <= 100
      ? scoreValue
      : null;

    const savedProject = await ProjectResult.create({
      userId: req.user._id,
      projectName: repoData.name || repository.repo,
      githubUrl: normalizedUrl,
      repositoryOwner: repository.owner,
      repositoryName: repository.repo,
      repoInfo: {
        name: repoData.name,
        description: repoData.description,
        language: repoData.language,
        stars: repoData.stars,
      },
      evaluation,
      overallScore,
    });

    return res.status(201).json({
      success: true,
      data: {
        id: savedProject._id,
        repoInfo: savedProject.repoInfo,
        evaluation: savedProject.evaluation,
        createdAt: savedProject.createdAt,
      },
    });
  } catch (error) {
    console.error('Project analysis failed:', error.message);
    const status = error.message && /not found/i.test(error.message) ? 404 : 500;
    return res.status(status).json({
      success: false,
      error: status === 404 ? error.message : 'Project analysis could not be completed.',
    });
  }
};

const getProjects = async (req, res) => {
  try {
    const projects = await ProjectResult.find({ userId: req.user._id })
      .select('projectName githubUrl repositoryOwner repositoryName repoInfo overallScore createdAt updatedAt')
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({ success: true, count: projects.length, data: projects });
  } catch (error) {
    console.error('Fetch project history failed:', error.message);
    return res.status(500).json({ success: false, error: 'Unable to retrieve project history.' });
  }
};

const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid project ID.' });
    }

    const project = await ProjectResult.findOne({ _id: id, userId: req.user._id }).lean();
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    return res.status(200).json({ success: true, data: project });
  } catch (error) {
    console.error('Fetch project failed:', error.message);
    return res.status(500).json({ success: false, error: 'Unable to retrieve this project.' });
  }
};

const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, error: 'Invalid project ID.' });
    }

    const project = await ProjectResult.findOneAndDelete({ _id: id, userId: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, error: 'Project not found.' });
    }

    return res.status(200).json({ success: true, message: 'Project deleted successfully.' });
  } catch (error) {
    console.error('Delete project failed:', error.message);
    return res.status(500).json({ success: false, error: 'Unable to delete this project.' });
  }
};

module.exports = { analyzeProject, getProjects, getProjectById, deleteProject };
