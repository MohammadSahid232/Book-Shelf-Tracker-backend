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

// Middleware
app.use(cors());
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

// Public Auth routes (Register, Login, Google OAuth)
app.use('/auth', AuthRoutes);

// Protected Task routes
app.use('/task', verifyToken, taskRoutes);
app.use('/tasks', verifyToken, taskRoutes);

// Protected Book routes
app.use('/api/books', verifyToken, bookRoutes);
app.use('/books', verifyToken, bookRoutes);

module.exports = app;
