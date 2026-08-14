const axios = require('axios');

// GET /api/discover/search?q=query
exports.searchGoogleBooks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length === 0) {
      return res.status(400).json({ message: 'Search query parameter (q) is required' });
    }

    let books = [];

    // 1. Try Google Books API
    try {
      const googleBooksUrl = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=20`;
      const response = await axios.get(googleBooksUrl, { timeout: 4000 });

      if (response.data.items && response.data.items.length > 0) {
        books = response.data.items.map((item) => {
          const info = item.volumeInfo || {};
          const imageLinks = info.imageLinks || {};
          const coverImage =
            imageLinks.thumbnail ||
            imageLinks.smallThumbnail ||
            'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';

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
      }
    } catch (googleErr) {
      console.warn('Google Books API unavailable/rate-limited, falling back to Open Library API:', googleErr.message);
    }

    // 2. If Google Books returned 0 results or failed/rate-limited, try Open Library API
    if (books.length === 0) {
      try {
        const openLibUrl = `https://openlibrary.org/search.json?q=${encodeURIComponent(q)}&limit=20`;
        const openLibRes = await axios.get(openLibUrl, { timeout: 6000 });

        if (openLibRes.data.docs && openLibRes.data.docs.length > 0) {
          books = openLibRes.data.docs.map((doc, idx) => {
            const coverId = doc.cover_i;
            const coverImage = coverId
              ? `https://covers.openlibrary.org/b/id/${coverId}-M.jpg`
              : 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?auto=format&fit=crop&q=80&w=400';

            return {
              id: doc.key ? doc.key.replace('/works/', '') : `openlib_${idx}_${Date.now()}`,
              title: doc.title || 'Untitled',
              author: doc.author_name ? doc.author_name.join(', ') : 'Unknown Author',
              genre: doc.subject ? doc.subject[0] : 'General',
              description: Array.isArray(doc.first_sentence) ? doc.first_sentence.join(' ') : (doc.first_sentence || 'Available in Open Library public catalog.'),
              coverImage,
              totalPages: doc.number_of_pages_median || 250,
              publishedDate: doc.first_publish_year ? String(doc.first_publish_year) : '',
              publisher: doc.publisher ? doc.publisher[0] : '',
              averageRating: 4.5,
              previewLink: `https://openlibrary.org${doc.key || ''}`,
            };
          });
        }
      } catch (openLibErr) {
        console.warn('Open Library API also failed:', openLibErr.message);
      }
    }

    return res.status(200).json({ books });
  } catch (err) {
    res.status(500).json({ message: 'Failed to search books catalog', details: err.message });
  }
};

