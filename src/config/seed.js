const Book = require('../models/bookModel');

// ─────────────────────────────────────────────────────────────────────────────
// All pdfUrl values are verified working from the backend (tested via axios).
// Each book has a UNIQUE PDF file — no two books share the same URL.
// ─────────────────────────────────────────────────────────────────────────────
const SAMPLE_BOOKS = [
  {
    title: 'Clean Code: A Handbook of Agile Software Craftsmanship',
    subtitle: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees.",
    author: 'Robert C. Martin',
    genre: 'Programming',
    language: 'English',
    publisher: 'Prentice Hall',
    publicationDate: new Date('2008-08-01'),
    isbn: '978-0132350884',
    description: "Even bad code can function. But if code isn't clean, it can bring a development organization to its knees. Every year, countless hours and significant resources are lost because of poorly written code. But it doesn't have to be that way.",
    tags: ['Programming', 'Software Engineering', 'Clean Code', 'Best Practices'],
    readingLevel: 'Intermediate',
    coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=500&q=80',
    // AlphaGo Zero paper — 20 pages, unique technical PDF
    pdfUrl: 'https://arxiv.org/pdf/1712.01815',
    downloadAllowed: true,
    featured: true,
    totalPages: 464,
    averageRating: 4.8,
    reviewCount: 124,
    viewCount: 1520,
    downloadCount: 380,
  },
  {
    title: 'Atomic Habits: An Easy & Proven Way to Build Good Habits & Break Bad Ones',
    subtitle: 'Tiny Changes, Remarkable Results',
    author: 'James Clear',
    genre: 'Self-Help',
    language: 'English',
    publisher: 'Avery',
    publicationDate: new Date('2018-10-16'),
    isbn: '978-0735211292',
    description: "No matter your goals, Atomic Habits offers a proven framework for improving every day. James Clear, one of the world's leading experts on habit formation, reveals practical strategies that will teach you exactly how to form good habits, break bad ones, and master the tiny behaviors that lead to remarkable results.",
    tags: ['Self Help', 'Productivity', 'Habits', 'Psychology'],
    readingLevel: 'All Ages',
    coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&q=80',
    // GPT-3 paper — 75 pages, comprehensive
    pdfUrl: 'https://arxiv.org/pdf/2005.14165',
    downloadAllowed: true,
    featured: true,
    totalPages: 320,
    averageRating: 4.9,
    reviewCount: 310,
    viewCount: 2450,
    downloadCount: 890,
  },
  {
    title: 'The Pragmatic Programmer: Your Journey to Mastery',
    subtitle: 'From Journeyman to Master',
    author: 'Andrew Hunt & David Thomas',
    genre: 'Programming',
    language: 'English',
    publisher: 'Addison-Wesley Professional',
    publicationDate: new Date('1999-10-30'),
    isbn: '978-0201616224',
    description: 'The Pragmatic Programmer cuts through the increasing specialization and technicalities of modern software development to examine the core process--taking a requirement and producing working, maintainable code that delights its users.',
    tags: ['Programming', 'Software Architecture', 'Career', 'Refactoring'],
    readingLevel: 'Intermediate',
    coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&q=80',
    // Dropout paper — 12 pages, unique
    pdfUrl: 'https://arxiv.org/pdf/1207.0580',
    downloadAllowed: true,
    featured: true,
    totalPages: 352,
    averageRating: 4.7,
    reviewCount: 98,
    viewCount: 1100,
    downloadCount: 290,
  },
  {
    title: 'Dune',
    subtitle: 'Book One of the Dune Chronicles',
    author: 'Frank Herbert',
    genre: 'Science Fiction',
    language: 'English',
    publisher: 'Chilton Books',
    publicationDate: new Date('1965-08-01'),
    isbn: '978-0441172719',
    description: 'Set on the desert planet Arrakis, Dune is the story of the boy Paul Atreides, heir to a noble family tasked with ruling an inhospitable world where the only thing of value is the "spice" melange.',
    tags: ['Sci-Fi', 'Classic', 'Fantasy', 'Space Opera'],
    readingLevel: 'Advanced',
    coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&q=80',
    // GAN original paper — 8 pages, minimal clean layout
    pdfUrl: 'https://arxiv.org/pdf/1406.2661',
    downloadAllowed: true,
    featured: false,
    totalPages: 658,
    averageRating: 4.6,
    reviewCount: 215,
    viewCount: 1890,
    downloadCount: 520,
  },
  {
    title: 'Zero to One: Notes on Startups, or How to Build the Future',
    subtitle: 'Notes on Startups, or How to Build the Future',
    author: 'Peter Thiel with Blake Masters',
    genre: 'Business',
    language: 'English',
    publisher: 'Crown Business',
    publicationDate: new Date('2014-09-16'),
    isbn: '978-0804139298',
    description: 'The great secret of our time is that there are still uncharted frontiers to explore and new inventions to create. In Zero to One, legendary entrepreneur and investor Peter Thiel shows how we can find singular ways to create those new things.',
    tags: ['Business', 'Startups', 'Entrepreneurship', 'Technology'],
    readingLevel: 'Intermediate',
    coverImage: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=500&q=80',
    // BERT paper — 16 pages, columnar academic format
    pdfUrl: 'https://arxiv.org/pdf/1810.04805',
    downloadAllowed: true,
    featured: false,
    totalPages: 224,
    averageRating: 4.5,
    reviewCount: 140,
    viewCount: 1340,
    downloadCount: 410,
  },
  {
    title: 'Project Hail Mary',
    subtitle: 'A Novel',
    author: 'Andy Weir',
    genre: 'Science Fiction',
    language: 'English',
    publisher: 'Ballantine Books',
    publicationDate: new Date('2021-05-04'),
    isbn: '978-0593135204',
    description: "Ryland Grace is the sole survivor on a desperate, last-chance mission—and if he fails, humanity and the earth itself will perish. Except that right now, he doesn't know that.",
    tags: ['Sci-Fi', 'Space', 'Survival', 'Science'],
    readingLevel: 'All Ages',
    coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&q=80',
    // ResNet paper — 16 pages, clean layout
    pdfUrl: 'https://arxiv.org/pdf/1512.03385',
    downloadAllowed: true,
    featured: true,
    totalPages: 496,
    averageRating: 4.9,
    reviewCount: 410,
    viewCount: 3100,
    downloadCount: 950,
  },
  {
    title: 'Deep Work: Rules for Focused Success in a Distracted World',
    subtitle: 'Rules for Focused Success in a Distracted World',
    author: 'Cal Newport',
    genre: 'Self-Help',
    language: 'English',
    publisher: 'Grand Central Publishing',
    publicationDate: new Date('2016-01-05'),
    isbn: '978-1455586691',
    description: "Deep work is the ability to focus without distraction on a cognitively demanding task. It's a skill that allows you to quickly master complicated information and produce better results in less time.",
    tags: ['Productivity', 'Focus', 'Self Help', 'Work'],
    readingLevel: 'All Ages',
    coverImage: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=500&q=80',
    // AlexNet paper — 9 pages, classic deep learning
    pdfUrl: 'https://proceedings.neurips.cc/paper_files/paper/2012/file/c399862d3b9d6b76c8436e924a68c45b-Paper.pdf',
    downloadAllowed: true,
    featured: false,
    totalPages: 304,
    averageRating: 4.7,
    reviewCount: 180,
    viewCount: 1620,
    downloadCount: 490,
  }
];

const seedDatabase = async () => {
  try {
    const count = await Book.countDocuments();
    if (count === 0) {
      console.log('🌱 Seeding initial library books...');
      await Book.insertMany(SAMPLE_BOOKS);
      console.log('✅ Library seeded with 7 initial books!');
    }
  } catch (err) {
    console.error('⚠️ Seed error:', err.message);
  }
};

module.exports = seedDatabase;
