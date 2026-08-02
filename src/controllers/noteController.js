const Note = require('../models/noteModel');

// GET /api/notes?bookId=...
exports.getNotes = async (req, res) => {
  try {
    const { bookId } = req.query;
    const filter = {};
    if (req.user && req.user.id) filter.user = req.user.id;
    if (bookId) filter.book = bookId;

    const notes = await Note.find(filter).populate('book', 'title author coverImage').sort({ createdAt: -1 });
    res.status(200).json(notes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/notes
exports.createNote = async (req, res) => {
  try {
    const noteData = { ...req.body };
    if (req.user && req.user.id) noteData.user = req.user.id;

    const newNote = await Note.create(noteData);
    res.status(201).json(newNote);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/notes/:id
exports.deleteNote = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user && req.user.id) query.user = req.user.id;

    const note = await Note.findOneAndDelete(query);
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.status(200).json({ message: 'Note deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
