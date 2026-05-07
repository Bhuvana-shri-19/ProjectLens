const OpenAI = require('openai');

let openai;
try {
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
} catch (e) {
  console.warn("OpenAI client init failed - check API key");
}

async function analyzeWithAI(repoData) {
  // Mock mode if no API key
  if (!process.env.OPENAI_API_KEY) {
    return getMockAIData(repoData);
  }

  try {
    const prompt = `Analyze the following project from technical interviewer perspective.
Project Name: ${repoData.name}
Description: ${repoData.description || 'N/A'}
Primary Language: ${repoData.language || 'N/A'}
Dependencies: ${JSON.stringify(repoData.dependencies || {})}
README Snippet: ${repoData.readme.substring(0, 1500)}

Return ONLY valid JSON:
{
  "impressivenessScore": 85,
  "complexityLevel": "Intermediate",
  "interviewerVerdict": "Strong project...",
  "strengths": [...],
  "weaknesses": [...],
  "improvementSuggestions": [...],
  "resumePoints": [...],
  "interviewQuestions": [...],
  "scoreBreakdown": {
    "innovation": 80,
    "codeQuality": 85,
    "uiUx": 70,
    "realWorldImpact": 90
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Senior software engineer evaluating candidate projects. JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content);
  } catch (error) {
    // Fallback to mock on API error
    return getMockAIData(repoData);
  }
}

function getMockAIData(repoData) {
  return {
    impressivenessScore: Math.floor(Math.random() * 20) + 70,
    complexityLevel: "Intermediate",
    interviewerVerdict: "Solid foundation with room for production polish.",
    strengths: [
      "Well-structured codebase.",
      "Appropriate tech stack usage.",
      "Clear README documentation."
    ],
    weaknesses: [
      "Limited advanced features.",
      "Testing coverage could be expanded.",
      "Minor optimization opportunities."
    ],
    improvementSuggestions: [
      "Add comprehensive testing suite.",
      "Implement caching for API calls.",
      "Containerize for deployment."
    ],
    resumePoints: [
      `Built ${repoData.name} demonstrating ${repoData.language} proficiency.`,
      "Integrated external APIs effectively.",
      "Designed scalable architecture."
    ],
    interviewQuestions: [
      "Walk through your project architecture.",
      "How did you handle edge cases?",
      "Deployment and scaling strategy?"
    ],
    scoreBreakdown: {
      innovation: 75,
      codeQuality: 80,
      uiUx: 70,
      realWorldImpact: 85
    }
  };
}

module.exports = { analyzeWithAI };
