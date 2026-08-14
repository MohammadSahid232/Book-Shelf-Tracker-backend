const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Book = require('../src/models/bookModel');

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  const books = await Book.find({}, 'title pdfUrl');
  books.forEach(b => {
    console.log(b.title + ' | ' + (b.pdfUrl || '(empty)'));
  });
  await mongoose.disconnect();
}
run().catch(e => { console.error(e.message); process.exit(1); });
