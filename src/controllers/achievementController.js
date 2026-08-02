const Achievement = require('../models/achievementModel');

const BADGE_META = {
  first_book:    { title: 'First Chapter', icon: '📖', desc: 'Added your first book to the shelf' },
  books_5:       { title: 'Bookworm',       icon: '🐛', desc: 'Finished 5 books' },
  books_10:      { title: 'Avid Reader',    icon: '📚', desc: 'Finished 10 books' },
  books_50:      { title: 'Literature Fan', icon: '🌟', desc: 'Finished 50 books' },
  books_100:     { title: 'Scholar',        icon: '🎓', desc: 'Finished 100 books' },
  pages_1000:    { title: 'Page Turner',    icon: '📄', desc: 'Read 1,000 pages' },
  pages_5000:    { title: 'Marathon Reader',icon: '🏃', desc: 'Read 5,000 pages' },
  streak_7:      { title: '7-Day Streak',   icon: '🔥', desc: 'Read for 7 days in a row' },
  streak_30:     { title: 'Dedicated',      icon: '💪', desc: 'Read for 30 days in a row' },
  streak_100:    { title: 'Unstoppable',    icon: '⚡', desc: 'Read for 100 days in a row' },
  top_reviewer:  { title: 'Critic',         icon: '✍️', desc: 'Written 10+ reviews' },
  book_collector:{ title: 'Collector',      icon: '🗂️', desc: 'Created 5+ collections' },
  early_bird:    { title: 'Early Bird',     icon: '🌅', desc: 'Read before 7am' },
  night_owl:     { title: 'Night Owl',      icon: '🦉', desc: 'Read after midnight' },
  speed_reader:  { title: 'Speed Reader',   icon: '⚡', desc: 'Finished a book in under 24 hours' },
};

// GET /api/achievements — user's achievements with metadata
exports.getAchievements = async (req, res) => {
  try {
    const unlocked = await Achievement.find({ user: req.user.id }).sort({ unlockedAt: -1 }).lean();

    const all = Object.entries(BADGE_META).map(([type, meta]) => {
      const found = unlocked.find((a) => a.type === type);
      return {
        type,
        ...meta,
        unlocked: !!found,
        unlockedAt: found?.unlockedAt || null,
      };
    });

    res.json({ achievements: all, count: unlocked.length, total: Object.keys(BADGE_META).length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
