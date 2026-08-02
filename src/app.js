const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const passport = require('passport');
const session = require('express-session');
require('./config/passport');

const taskRoutes = require('./routes/taskRoutes');
const bookRoutes = require('./routes/bookRoutes');
const AuthRoutes = require('./routes/AuthRoutes');
const aiRoutes = require('./routes/aiRoutes');
const discoverRoutes = require('./routes/discoverRoutes');
const noteRoutes = require('./routes/noteRoutes');
const goalRoutes = require('./routes/goalRoutes');
const verifyToken = require('./middlewares/VerifyToken');

const app = express();

// Security Headers with Helmet
app.use(helmet({ crossOriginResourcePolicy: false }));

// Rate Limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 300, // limit each IP to 300 requests per window
  message: { message: 'Too many requests from this IP, please try again later.' },
});
app.use(limiter);

// --- CORS Configuration ---
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

// Root health-check route
app.get('/', (req, res) => {
  res.json({
    name: 'BookShelf AI Backend API',
    status: 'online',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes (Public & Protected)
app.use('/auth', AuthRoutes);
app.use('/api/auth', AuthRoutes);

// Protected Core Modules
app.use('/api/books', verifyToken, bookRoutes);
app.use('/books', verifyToken, bookRoutes);

app.use('/api/ai', verifyToken, aiRoutes);
app.use('/api/discover', verifyToken, discoverRoutes);
app.use('/api/notes', verifyToken, noteRoutes);
app.use('/api/goals', verifyToken, goalRoutes);

app.use('/task', verifyToken, taskRoutes);
app.use('/tasks', verifyToken, taskRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err.stack || err.message);
  res.status(500).json({
    message: err.message || 'Internal Server Error',
  });
});

module.exports = app;
