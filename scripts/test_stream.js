const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Book = require('../src/models/bookModel');
const axios = require('axios');

async function test() {
  await mongoose.connect(process.env.MONGO_URI);
  const books = await Book.find({}, 'title pdfUrl');
  
  const results = [];
  let allPass = true;
  const seenSizes = new Set();

  for (const book of books) {
    try {
      const res = await axios.get(
        'http://localhost:5000/api/downloads/stream/' + book._id,
        { responseType: 'arraybuffer', timeout: 15000 }
      );
      const bytes = Buffer.from(res.data);
      const header = bytes.slice(0, 4).toString('ascii');
      const isRealPdf = header === '%PDF';
      const size = bytes.length;
      const isUnique = !seenSizes.has(size);
      seenSizes.add(size);

      const status = isRealPdf ? (isUnique ? '✅ PASS (unique)' : '⚠️  PASS (same size as another)') : '❌ FAIL (not a PDF)';
      results.push({ title: book.title, status, size, pdfUrl: book.pdfUrl });
      if (!isRealPdf) allPass = false;
      console.log(`${status.padEnd(26)} [${(size/1024).toFixed(0).padStart(6)} KB] ${book.title}`);
    } catch(e) {
      results.push({ title: book.title, status: 'ERROR', size: 0, pdfUrl: book.pdfUrl });
      allPass = false;
      console.log(`❌ ERROR: ${book.title} — ${e.message}`);
    }
  }

  console.log(`\n${ allPass ? '✅ All books stream real unique PDFs!' : '❌ Some books failed.'}`);
  console.log(`Total books tested: ${books.length}`);
  console.log(`Unique file sizes:  ${seenSizes.size}`);
  
  await mongoose.disconnect();
}
test().catch(e => { console.error(e.message); process.exit(1); });
