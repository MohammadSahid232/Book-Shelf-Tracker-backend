const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const session = require('express-session');
require('./config/passport');

// ── Existing Routes ────────────────────────────────────────────────────────────
const taskRoutes        = require('./routes/taskRoutes');
const bookRoutes        = require('./routes/bookRoutes');
const AuthRoutes        = require('./routes/AuthRoutes');
const aiRoutes          = require('./routes/aiRoutes');
const discoverRoutes    = require('./routes/discoverRoutes');
const noteRoutes        = require('./routes/noteRoutes');
const goalRoutes        = require('./routes/goalRoutes');

// ── New Platform Routes ────────────────────────────────────────────────────────
const libraryRoutes      = require('./routes/libraryRoutes');
const shelfRoutes        = require('./routes/shelfRoutes');
const reviewRoutes       = require('./routes/reviewRoutes');
const bookmarkRoutes     = require('./routes/bookmarkRoutes');
const collectionRoutes   = require('./routes/collectionRoutes');
const achievementRoutes  = require('./routes/achievementRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const downloadRoutes     = require('./routes/downloadRoutes');
const adminRoutes        = require('./routes/adminRoutes');

const verifyToken = require('./middlewares/VerifyToken');

const app = express();

// ── Security ──────────────────────────────────────────────────────────────────
app.use(helmet({ crossOriginResourcePolicy: false }));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  message: { message: 'Too many requests, please try again later.' },
});
app.use(limiter);

// ── CORS ──────────────────────────────────────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
        callback(null, true);
      } else {
        callback(new Error(`CORS policy: Origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(
  session({
    secret: process.env.JWT_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());

// ── Health Check ──────────────────────────────────────────────────────────────
app.get('/', (req, res) => {
  res.json({
    name: 'BookShelf AI — Digital Library Platform API',
    status: 'online',
    version: '3.0.0',
    timestamp: new Date().toISOString(),
    endpoints: [
      '/auth', '/api/auth',
      '/api/books', '/api/library', '/api/shelf',
      '/api/reviews', '/api/bookmarks', '/api/collections',
      '/api/achievements', '/api/notifications', '/api/downloads',
      '/api/admin', '/api/ai', '/api/discover',
    ],
  });
});

// ── Auth Routes (Public) ───────────────────────────────────────────────────────
app.use('/auth', AuthRoutes);
app.use('/api/auth', AuthRoutes);

// ── Public / Optional-Auth Routes ─────────────────────────────────────────────
app.use('/api/library', libraryRoutes);        // Public library catalog

// ── Authenticated Routes ───────────────────────────────────────────────────────
app.use('/api/books',         verifyToken, bookRoutes);
app.use('/books',             verifyToken, bookRoutes);
app.use('/api/shelf',         verifyToken, shelfRoutes);
app.use('/api/reviews',       verifyToken, reviewRoutes);
app.use('/api/bookmarks',     verifyToken, bookmarkRoutes);
app.use('/api/collections',   verifyToken, collectionRoutes);
app.use('/api/achievements',  verifyToken, achievementRoutes);
app.use('/api/notifications', verifyToken, notificationRoutes);
app.use('/api/downloads',     verifyToken, downloadRoutes);
app.use('/api/admin',         verifyToken, adminRoutes);  // isAdmin applied inside adminRoutes
app.use('/api/ai',            verifyToken, aiRoutes);
app.use('/api/discover',      verifyToken, discoverRoutes);
app.use('/api/notes',         verifyToken, noteRoutes);
app.use('/api/goals',         verifyToken, goalRoutes);
app.use('/task',              verifyToken, taskRoutes);
app.use('/tasks',             verifyToken, taskRoutes);

// ── Global Error Handler ───────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err.message);
  res.status(500).json({ message: err.message || 'Internal Server Error' });
});

module.exports = app;
