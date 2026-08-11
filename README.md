# 📚 BookShelf AI — Modern MERN SaaS Library & Reading Companion

[![CI Pipeline](https://github.com/MohammadSahid232/Book-Shelf-Tracker/actions/workflows/ci.yml/badge.svg)](https://github.com/MohammadSahid232/Book-Shelf-Tracker/actions/workflows/ci.yml)
[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/MohammadSahid232/Book-Shelf-Tracker)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

**BookShelf AI** is a production-grade full-stack MERN (MongoDB, Express, React, Node.js) web application engineered for book lovers, avid readers, and researchers. It combines a modern Goodreads/Notion-inspired SaaS interface with AI-driven book recommendations, Google Books API live discovery, interactive reading statistics, and progress tracking.

---

## ✨ Key Features

### 🤖 1. Gemini AI Book Recommendations & Insights
- **Smart Recommendations (`POST /api/ai/recommend`)**: Analyzes finished books, ratings, favorite genres, and reviews using Google Gemini AI to generate 3 personalized next-book recommendations with reasons, confidence score, difficulty rating, and estimated reading time.
- **Reading Habits & Insights (`GET /api/ai/insights`)**: Calculates reading speed, reading streak, monthly completion summaries, and automated goal recommendations.

### 🌐 2. Live Google Books Discovery
- **Online Search**: Search millions of books worldwide by Title, Author, or Keyword via Google Books API.
- **1-Click Import**: Preview cover artwork, descriptions, and page counts, then import books directly into your personal digital shelf with one click.

### 📊 3. Modern SaaS Dashboard & Analytics
- **Hero Metrics**: Instant count of Total Books, Reading, Finished, Want to Read, Favorites, Average Rating, and Top Genre.
- **Visual Analytics**: Interactive Recharts graphs showing Monthly Reading Trends, Genre Breakdown, and Rating Distribution.
- **Goal Progress Tracking**: Set annual or monthly reading goals with dynamic visual completion bars.

### 📚 4. Book Library Management
- **Search & Multi-Filter**: Filter by Status, Genre, or Rating; search by Title, Author, or Genre; sort by Date Added, Title, Rating, or Reading Progress.
- **Reading Progress Bar**: Log current page against total pages to calculate exact reading percentage.
- **Star Ratings & Reviews**: Rate books 1-5 stars and attach personalized reviews.
- **Favorites & Notes**: Heart favorite books and save book notes/quotes.

### 🔒 5. Security & Authentication
- JWT Token Authentication & Google OAuth 2.0.
- Profile Management: Update first/last name, bio, favorite genres, custom avatar URL, and change password.
- Server Security: Helmet HTTP security headers, CORS origin allowlists, and Express Rate Limiting.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 18, Vite 8
- **Styling**: Tailwind CSS 4, DaisyUI 5, Glassmorphic Modern UI
- **Icons & Motion**: Lucide React Icons, Framer Motion
- **Charts**: Recharts
- **State & Router**: React Context API, React Router DOM v6
- **Notifications**: React Hot Toast

### Backend
- **Runtime**: Node.js, Express.js
- **Database**: MongoDB Atlas via Mongoose ODM
- **AI Integration**: Google Generative AI (`@google/generative-ai` / Gemini 1.5 Flash)
- **Authentication**: JSON Web Tokens (JWT), Passport.js (Google OAuth 2.0), Bcrypt.js
- **Security**: Helmet, Express Rate Limit, CORS Allowlist

---

## 🚀 Environment Variables Setup

### Backend Environment Variables (`./backend/.env`)
```env
PORT=5000
NODE_ENV=production
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/book_shelf_tracker
JWT_SECRET=supersecretjwtkey_bookshelf_2026
FRONTEND_URL=https://your-frontend.netlify.app
BACKEND_URL=https://your-backend.onrender.com
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GEMINI_API_KEY=your_gemini_api_key
```

### Frontend Environment Variables (`./frontend/.env`)
```env
VITE_API_URL=http://localhost:5000
```

---

## 🔌 API Endpoints Summary

### Authentication Routes (`/auth` / `/api/auth`)
- `POST /auth/register` — Register a new account
- `POST /auth/login` — Sign in and retrieve JWT token
- `GET /auth/me` — Fetch current user profile
- `PUT /auth/profile` — Update user profile & avatar
- `PUT /auth/change-password` — Change account password
- `GET /auth/google` — Initiate Google OAuth 2.0 flow

### Book Management Routes (`/api/books`)
- `GET /api/books` — Retrieve user books (query params: `search`, `status`, `genre`, `rating`, `sortBy`, `order`)
- `GET /api/books/stats` — Fetch dashboard metrics and chart statistics
- `GET /api/books/:id` — Retrieve a single book by ID
- `POST /api/books` — Add a new book to library
- `PATCH /api/books/:id` / `PUT /api/books/:id` — Update book details or reading progress
- `DELETE /api/books/:id` — Remove book from library

### AI Module Routes (`/api/ai`)
- `POST /api/ai/recommend` — Generate 3 Gemini AI next-book recommendations
- `GET /api/ai/insights` — Generate reading speed and streak insights

### Discover Routes (`/api/discover`)
- `GET /api/discover/search?q=...` — Search Google Books API live

---

## 🌐 Deployment Instructions

### Render Deployment (Backend)
1. Repository: `MohammadSahid232/Book-Shelf-Tracker-backend`
2. Environment: `Node`
3. Build Command: `npm install`
4. Start Command: `node server.js`
5. Set Environment Variables listed above.

### Netlify Deployment (Frontend)
1. Repository: `MohammadSahid232/Book-Shelf-Tracker`
2. Base Directory: `frontend`
3. Build Command: `npm run build`
4. Publish Directory: `dist`
5. Environment Variable: `VITE_API_URL` = *(Your Render backend URL)*
