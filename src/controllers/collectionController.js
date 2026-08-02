const Collection = require('../models/collectionModel');
const Book = require('../models/bookModel');

// GET /api/collections — user's collections
exports.getCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ user: req.user.id })
      .populate('books', 'title author coverImage genre')
      .sort({ updatedAt: -1 })
      .lean();
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/collections/public — public collections from all users
exports.getPublicCollections = async (req, res) => {
  try {
    const collections = await Collection.find({ isPublic: true })
      .populate('user', 'first_name last_name avatar')
      .populate('books', 'title author coverImage genre')
      .sort({ updatedAt: -1 })
      .limit(50)
      .lean();
    res.json(collections);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /api/collections/:id
exports.getCollectionById = async (req, res) => {
  try {
    const collection = await Collection.findById(req.params.id)
      .populate('books', 'title author genre coverImage description averageRating')
      .populate('user', 'first_name last_name avatar')
      .lean();
    if (!collection) return res.status(404).json({ message: 'Collection not found' });
    if (!collection.isPublic && collection.user._id.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Private collection' });
    }
    res.json(collection);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/collections — create new collection
exports.createCollection = async (req, res) => {
  try {
    const { name, description, isPublic, tags } = req.body;
    if (!name) return res.status(400).json({ message: 'Collection name is required' });

    const collection = await Collection.create({
      user: req.user.id,
      name,
      description: description || '',
      isPublic: isPublic || false,
      tags: tags || [],
    });
    res.status(201).json(collection);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/collections/:id — update collection metadata
exports.updateCollection = async (req, res) => {
  try {
    const collection = await Collection.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      { $set: req.body },
      { new: true }
    );
    if (!collection) return res.status(404).json({ message: 'Collection not found' });
    res.json(collection);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/collections/:id
exports.deleteCollection = async (req, res) => {
  try {
    const c = await Collection.findOneAndDelete({ _id: req.params.id, user: req.user.id });
    if (!c) return res.status(404).json({ message: 'Collection not found' });
    res.json({ message: 'Collection deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/collections/:id/books — add book to collection
exports.addBook = async (req, res) => {
  try {
    const { bookId } = req.body;
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user.id });
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    if (!collection.books.includes(bookId)) {
      collection.books.push(bookId);
      await collection.save();
    }
    res.json({ message: 'Book added to collection', count: collection.books.length });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/collections/:id/books/:bookId — remove book
exports.removeBook = async (req, res) => {
  try {
    const collection = await Collection.findOne({ _id: req.params.id, user: req.user.id });
    if (!collection) return res.status(404).json({ message: 'Collection not found' });

    collection.books = collection.books.filter((b) => b.toString() !== req.params.bookId);
    await collection.save();
    res.json({ message: 'Book removed from collection' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
