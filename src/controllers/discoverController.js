const axios = require('axios');

// GET /api/discover/search?q=query
exports.searchGoogleBooks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query parameter (q) is required' });
    }

    const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20`;
    const response = await axios.get(googleBooksUrl);

    if (!response.data.items) {
      return res.status(200).json({ books: [] });
    }

    const books = response.data.items.map((item) => {
      const info = item.volumeInfo || {};
      const imageLinks = info.imageLinks || {};
      const coverImage = imageLinks.thumbnail || imageLinks.smallThumbnail || 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';

      return {
        id: item.id,
        title: info.title || 'Untitled',
        author: info.authors ? info.authors.join(', ') : 'Unknown Author',
        genre: info.categories ? info.categories[0] : 'General',
        description: info.description || 'No description available.',
        coverImage: coverImage.replace('http://', 'https://'),
        totalPages: info.pageCount || 0,
        publishedDate: info.publishedDate || '',
        publisher: info.publisher || '',
        averageRating: info.averageRating || 0,
        previewLink: info.previewLink || '',
      };
    });

    res.status(200).json({ books });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch books from Google Books API', details: err.message });
  }
};
