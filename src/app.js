const express = require('express');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
require('./config/passport');

const taskRoutes = require('./routes/taskRoutes');
const bookRoutes = require('./routes/bookRoutes');
const AuthRoutes = require('./routes/AuthRoutes');
const verifyToken = require('./middlewares/VerifyToken');

const app = express();

// --- CORS Configuration ---
// Allow requests from both local dev and Netlify production frontend
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean); // remove undefined/empty

app.use(cors({
  origin: (origin, callback) => {
    // allow non-browser requests (curl, Render health checks) and allowed origins
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy: Origin ${origin} not allowed`));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
  res.json({ message: 'BookShelf Tracker Backend API is running successfully!' });
});

// Public Auth routes (Register, Login, Google OAuth)
app.use('/auth', AuthRoutes);

// Protected Task routes
app.use('/task', verifyToken, taskRoutes);
app.use('/tasks', verifyToken, taskRoutes);

// Protected Book routes
app.use('/api/books', verifyToken, bookRoutes);
app.use('/books', verifyToken, bookRoutes);

module.exports = app;
