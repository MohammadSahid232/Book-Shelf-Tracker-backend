require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

async function generateContent(prompt) {
  if (process.env.GEMINI_API_KEY && genAI) {
    const candidateModels = [
      'gemini-3.6-flash',
      'gemini-2.0-flash',
      'gemini-flash-latest',
      'gemini-2.0-flash-lite',
    ];

    for (const modelName of candidateModels) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        if (text && text.trim()) {
          return text.trim();
        }
      } catch (error) {
        console.warn(`GeminiService model (${modelName}) failed:`, error.message);
      }
    }
  }

  // Fallback summary generator if Gemini API key is missing or temporary quota rate-limited
  const matchTitle = prompt.match(/- Title:\s*(.*)/i);
  const matchDesc = prompt.match(/- Description:\s*(.*)/i);
  const title = matchTitle ? matchTitle[1].trim() : 'Task';
  const desc = matchDesc ? matchDesc[1].trim() : '';

  return `This task "${title}" focuses on ${desc || 'completing project action items efficiently'}.`;
}

module.exports = { generateContent };


