const { fetchRepoData } = require('../utils/githubHelper');
const { analyzeWithAI } = require('../utils/aiHelper');

// In a real app, you would import a Mongoose model here to save the results
// const ProjectResult = require('../models/ProjectResult');

const analyzeProject = async (req, res) => {
  try {
    const { githubUrl } = req.body;

    if (!githubUrl) {
      return res.status(400).json({ success: false, error: 'GitHub URL is required' });
    }

    // 1. Fetch data from GitHub
    const repoData = await fetchRepoData(githubUrl);
    
    // 2. Send to AI for evaluation
    const evaluation = await analyzeWithAI(repoData);

    // 3. (Optional) Save to Database
    // const newResult = new ProjectResult({ githubUrl, repoData, evaluation });
    // await newResult.save();

    // 4. Return the result
    return res.status(200).json({
      success: true,
      data: {
        repoInfo: {
          name: repoData.name,
          description: repoData.description,
          language: repoData.language,
          stars: repoData.stars,
        },
        evaluation
      }
    });

  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

module.exports = {
  analyzeProject
};
