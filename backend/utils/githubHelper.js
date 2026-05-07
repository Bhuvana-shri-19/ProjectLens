const axios = require('axios');

/**
 * Extracts owner and repo name from a GitHub URL
 */
function parseGithubUrl(url) {
  try {
    const parsed = new URL(url);
    const pathParts = parsed.pathname.split('/').filter(Boolean);
    if (pathParts.length >= 2) {
      return { owner: pathParts[0], repo: pathParts[1] };
    }
  } catch (error) {
    // Fallback to 'owner/repo' format
    const parts = url.split('/');
    if (parts.length === 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  }
  return null;
}

/**
 * Fetches repository data from GitHub API
 */
async function fetchRepoData(githubUrl) {
  const repoInfo = parseGithubUrl(githubUrl);
  if (!repoInfo) {
    throw new Error('Invalid GitHub repository URL. Use full URL or owner/repo format.');
  }

  const { owner, repo } = repoInfo;
  const headers = {};
  
  if (process.env.GITHUB_TOKEN) {
    headers.Authorization = `token ${process.env.GITHUB_TOKEN}`;
  }

  try {
    // Repository details
    const repoDetailsRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}`, { headers });
    
    // README (silent if missing)
    let readme = '';
    try {
      const readmeRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/readme`, { headers });
      readme = Buffer.from(readmeRes.data.content, 'base64').toString('utf-8');
    } catch (err) {
      // README optional
    }

    // package.json for deps (optional)
    let packageJson = null;
    try {
      const pkgRes = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/package.json`, { headers });
      const pkgContent = Buffer.from(pkgRes.data.content, 'base64').toString('utf-8');
      packageJson = JSON.parse(pkgContent);
    } catch (err) {
      // Not JS project or no package.json
    }

    return {
      name: repoDetailsRes.data.name,
      description: repoDetailsRes.data.description,
      language: repoDetailsRes.data.language,
      stars: repoDetailsRes.data.stargazers_count,
      readme: readme.substring(0, 5000),
      dependencies: packageJson ? { ...packageJson.dependencies, ...packageJson.devDependencies } : null
    };

  } catch (error) {
    let message = 'Failed to fetch repository data.';
    if (error.response?.status === 404) {
      message = 'Repository not found. Check URL.';
    } else if (error.response?.status === 403) {
      message = 'API rate limit exceeded. Add GITHUB_TOKEN.';
    }
    throw new Error(message);
  }
}

module.exports = { fetchRepoData };
