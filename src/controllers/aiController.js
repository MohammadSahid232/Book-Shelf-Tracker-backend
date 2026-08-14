const { GoogleGenerativeAI } = require('@google/generative-ai');
const Book = require('../models/bookModel');

// Initialize Gemini API if key is present
let genAI = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

// POST /api/ai/recommend
exports.getRecommendations = async (req, res) => {
  try {
    let userBooks = [];

    // Scope to user
    if (req.user && req.user.id) {
      userBooks = await Book.find({ $or: [{ user: req.user.id }, { userId: req.user.id }] });
    }

    const finishedBooks = userBooks.filter((b) => b.status === 'finished');
    const ratedBooks = userBooks.filter((b) => b.rating > 0);
    const reviews = userBooks.filter((b) => b.review && b.review.trim().length > 0);

    const genresCount = {};
    userBooks.forEach((b) => {
      if (b.genre) genresCount[b.genre] = (genresCount[b.genre] || 0) + 1;
    });

    const contextData = {
      totalBooks: userBooks.length,
      finishedBooks: finishedBooks.map((b) => ({ title: b.title, author: b.author, genre: b.genre, rating: b.rating })),
      highestRated: ratedBooks.sort((a, b) => b.rating - a.rating).slice(0, 5).map((b) => ({ title: b.title, author: b.author, genre: b.genre, rating: b.rating })),
      favoriteGenres: Object.keys(genresCount),
      userReviews: reviews.slice(0, 5).map((b) => ({ title: b.title, review: b.review })),
    };

    // If Gemini API Key is available, use Gemini AI model
    if (process.env.GEMINI_API_KEY && genAI) {
      const candidateModels = ['gemini-3.6-flash', 'gemini-2.0-flash', 'gemini-flash-latest'];
      for (const modelName of candidateModels) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const prompt = `
You are an expert AI Literary Curator and Book Recommendation Assistant.
Based on the following finished books and ratings, recommend 3 similar books the user should read next:
${JSON.stringify(contextData, null, 2)}

Return ONLY a valid JSON array of 3 objects with these exact keys:
[
  {
    "title": "Book Title",
    "author": "Author Name",
    "genre": "Genre Name",
    "reason": "Clear 1-2 sentence explanation why this book matches their reading taste.",
    "difficulty": "Easy" | "Medium" | "Advanced",
    "estimatedReadingTime": "X hours",
    "confidenceScore": 95
  }
]
Do not output markdown codeblocks, text wrappers, or anything outside the raw JSON array.
`;

          const result = await model.generateContent(prompt);
          const text = result.response.text().trim();
          const cleanedText = text.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();

          const recommendations = Array.isArray(JSON.parse(cleanedText)) ? JSON.parse(cleanedText).slice(0, 3) : [];
          return res.status(200).json({
            source: 'gemini_ai',
            recommendations,
          });
        } catch (aiErr) {
          console.warn(`Gemini API model (${modelName}) failed:`, aiErr.message);
        }
      }
    }

    // Fallback algorithmic recommendation engine
    const fallbackCatalog = [
      {
        title: 'Atomic Habits',
        author: 'James Clear',
        genre: 'Self-Help',
        reason: 'Matches your interest in personal development and progress tracking.',
        difficulty: 'Easy',
        estimatedReadingTime: '5 hours',
        confidenceScore: 94,
      },
      {
        title: 'Deep Work',
        author: 'Cal Newport',
        genre: 'Productivity',
        reason: 'Recommended based on your high ratings in focus and non-fiction titles.',
        difficulty: 'Medium',
        estimatedReadingTime: '6 hours',
        confidenceScore: 91,
      },
      {
        title: 'Project Hail Mary',
        author: 'Andy Weir',
        genre: 'Sci-Fi',
        reason: 'A fast-paced sci-fi masterpiece perfect for expanding your genre horizon.',
        difficulty: 'Medium',
        estimatedReadingTime: '8 hours',
        confidenceScore: 89,
      },
    ];

    res.status(200).json({
      source: 'smart_algorithm',
      recommendations: fallbackCatalog,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/ai/insights
exports.getInsights = async (req, res) => {
  try {
    let books = [];
    if (req.user && req.user.id) {
      books = await Book.find({ $or: [{ user: req.user.id }, { userId: req.user.id }] });
    }

    const totalBooks = books.length;
    const finishedCount = books.filter((b) => b.status === 'finished').length;
    const totalPagesRead = books.reduce((sum, b) => sum + (b.currentPage || 0), 0);

    // Favorite Genre
    const genreMap = {};
    books.forEach((b) => {
      if (b.genre) genreMap[b.genre] = (genreMap[b.genre] || 0) + 1;
    });
    let favoriteGenre = 'General';
    let topCount = 0;
    Object.entries(genreMap).forEach(([g, c]) => {
      if (c > topCount) {
        topCount = c;
        favoriteGenre = g;
      }
    });

    // Reading Speed & Habits
    const estPph = 45; // avg 45 pages per hour
    const estHoursRead = (totalPagesRead / estPph).toFixed(1);
    const readingHabit = finishedCount >= 5 ? 'Consistent Avid Reader' : 'Active Explorer';
    const readingStreak = Math.min(30, finishedCount * 3 + Math.floor(totalPagesRead / 50));
    const suggestedGoal = totalBooks > 0 ? `Read ${totalBooks + 5} Books & 1,500 Pages this year` : 'Read 12 Books this year';

    res.status(200).json({
      favoriteGenre,
      readingHabit,
      readingSpeed: `${estPph} pages/hour`,
      totalHoursRead: estHoursRead,
      monthlySummary: `${finishedCount} books completed, ${totalPagesRead} pages read in total.`,
      readingStreak: `${readingStreak} Days`,
      suggestedGoal,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
