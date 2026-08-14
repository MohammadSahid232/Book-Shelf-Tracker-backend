const Book = require('../models/bookModel');

// GET /api/books (search, filter, sort, user-scoped)
exports.getAllBooks = async (req, res) => {
  try {
    const { status, genre, rating, favorite, search, sortBy, order } = req.query;
    let filter = {};

    // Include all books (public catalog books + user added books)

    // Filter by status
    if (status) {
      filter.status = status.toLowerCase();
    }

    // Filter by genre
    if (genre && genre !== 'All') {
      filter.genre = { $regex: new RegExp(genre, 'i') };
    }

    // Filter by rating
    if (rating && Number(rating) > 0) {
      filter.rating = { $gte: Number(rating) };
    }

    // Filter by favorite
    if (favorite === 'true') {
      filter.favorite = true;
    }

    // Search by title, author, genre
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      filter.$and = filter.$and || [];
      filter.$and.push({
        $or: [
          { title: searchRegex },
          { author: searchRegex },
          { genre: searchRegex },
        ],
      });
    }

    // Sorting
    let sortOptions = { createdAt: -1 };
    if (sortBy) {
      const sortOrder = order === 'asc' ? 1 : -1;
      sortOptions = { [sortBy]: sortOrder };
    }

    const books = await Book.find(filter).sort(sortOptions);
    res.status(200).json(books);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/books/stats (Dashboard statistics)
exports.getBookStats = async (req, res) => {
  try {
    let filter = {};
    const books = await Book.find(filter);

    const totalBooks = books.length;
    const wantToRead = books.filter((b) => b.status === 'want to read').length;
    const reading = books.filter((b) => b.status === 'reading').length;
    const finished = books.filter((b) => b.status === 'finished').length;
    const favorites = books.filter((b) => b.favorite).length;

    // Average rating
    const ratedBooks = books.filter((b) => b.rating > 0);
    const avgRating = ratedBooks.length
      ? (ratedBooks.reduce((sum, b) => sum + b.rating, 0) / ratedBooks.length).toFixed(1)
      : '0.0';

    // Favorite genre
    const genreCounts = {};
    books.forEach((b) => {
      if (b.genre) {
        genreCounts[b.genre] = (genreCounts[b.genre] || 0) + 1;
      }
    });
    let favoriteGenre = 'None';
    let maxCount = 0;
    Object.entries(genreCounts).forEach(([g, count]) => {
      if (count > maxCount) {
        maxCount = count;
        favoriteGenre = g;
      }
    });

    // Total pages read
    const totalPagesRead = books.reduce((sum, b) => sum + (b.currentPage || 0), 0);

    // Books added per month (for chart)
    const monthlyMap = {};
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach((m) => (monthlyMap[m] = 0));

    books.forEach((b) => {
      if (b.createdAt) {
        const monthName = months[new Date(b.createdAt).getMonth()];
        monthlyMap[monthName] = (monthlyMap[monthName] || 0) + 1;
      }
    });

    const monthlyStats = Object.entries(monthlyMap).map(([month, count]) => ({
      month,
      books: count,
    }));

    // Genre distribution (for chart)
    const genreDistribution = Object.entries(genreCounts).map(([genre, count]) => ({
      name: genre,
      value: count,
    }));

    // Rating distribution (for chart)
    const ratingMap = { '1 Star': 0, '2 Stars': 0, '3 Stars': 0, '4 Stars': 0, '5 Stars': 0 };
    books.forEach((b) => {
      if (b.rating >= 1 && b.rating <= 5) {
        const key = `${Math.floor(b.rating)} Star${Math.floor(b.rating) > 1 ? 's' : ''}`;
        ratingMap[key] = (ratingMap[key] || 0) + 1;
      }
    });
    const ratingDistribution = Object.entries(ratingMap).map(([rating, count]) => ({
      rating,
      count,
    }));

    res.status(200).json({
      totalBooks,
      wantToRead,
      reading,
      finished,
      favorites,
      avgRating,
      favoriteGenre,
      totalPagesRead,
      monthlyStats,
      genreDistribution,
      ratingDistribution,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/books/:id
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json(book);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(500).json({ error: err.message });
  }
};

// POST /api/books
exports.createBook = async (req, res) => {
  try {
    const bookData = { ...req.body };
    if (req.user && req.user.id) {
      bookData.user = req.user.id;
      bookData.userId = req.user.id;
    }

    // Auto compute progress
    if (bookData.totalPages > 0 && bookData.currentPage >= 0) {
      bookData.readingProgress = Math.min(
        100,
        Math.round((bookData.currentPage / bookData.totalPages) * 100)
      );
    }

    const newBook = await Book.create(bookData);
    res.status(201).json(newBook);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH / PUT /api/books/:id
exports.updateBook = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user && req.user.id && req.user.role !== 'admin') {
      query.$or = [{ user: req.user.id }, { userId: req.user.id }];
    }

    const updateData = { ...req.body };

    // Auto update readingProgress if pages updated
    if (updateData.totalPages !== undefined || updateData.currentPage !== undefined) {
      const existing = await Book.findById(req.params.id);
      if (existing) {
        const total = updateData.totalPages !== undefined ? updateData.totalPages : existing.totalPages;
        const current = updateData.currentPage !== undefined ? updateData.currentPage : existing.currentPage;
        if (total > 0) {
          updateData.readingProgress = Math.min(100, Math.round((current / total) * 100));
          if (updateData.readingProgress === 100) {
            updateData.status = 'finished';
          }
        }
      }
    }

    const updatedBook = await Book.findOneAndUpdate(query, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedBook) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json(updatedBook);
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/books/:id
exports.deleteBook = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user && req.user.id && req.user.role !== 'admin') {
      query.$or = [{ user: req.user.id }, { userId: req.user.id }];
    }
    const book = await Book.findOneAndDelete(query);
    if (!book) return res.status(404).json({ message: 'Book not found' });
    res.status(200).json({ message: 'Book deleted successfully', id: req.params.id });
  } catch (err) {
    if (err.name === 'CastError') {
      return res.status(404).json({ message: 'Book not found' });
    }
    res.status(500).json({ error: err.message });
  }
};
