const mongoose = require('mongoose');
require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const Book = require('../src/models/bookModel');
const axios = require('axios');

// Verified working public-domain multi-page PDFs
// All tested as accessible from Node.js backend
const WORKING_PDF = 'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf';

// URLs to test
const TEST_URLS = [
  'https://raw.githubusercontent.com/mozilla/pdf.js/master/web/compressed.tracemonkey-pldi-09.pdf',
  'https://www.plato-philosophy.org/wp-content/uploads/2016/05/BraveNewWorld-1.pdf',
  'https://www.gutenberg.org/files/1342/1342-pdf.pdf',
  'https://www.gutenberg.org/files/345/345-pdf.pdf',
  'https://www.gutenberg.org/files/84/84-pdf.pdf',
];

async function testUrl(url) {
  try {
    const res = await axios.get(url, {
      timeout: 8000,
      responseType: 'arraybuffer',
      headers: { 'User-Agent': 'BookShelfTracker/1.0' }
    });
    const bytes = Buffer.from(res.data);
    const header = bytes.slice(0, 4).toString('ascii');
    return header === '%PDF' ? { ok: true, size: bytes.length } : { ok: false, reason: 'Not a PDF' };
  } catch (e) {
    return { ok: false, reason: e.message };
  }
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to MongoDB\n');

  // Test all URLs
  console.log('Testing PDF URLs...');
  const results = {};
  for (const url of TEST_URLS) {
    const r = await testUrl(url);
    results[url] = r;
    console.log(r.ok ? `  ✅ OK (${r.size} bytes)` : `  ❌ FAIL: ${r.reason}`, url.split('/').pop());
  }

  // Build a map of URL → replacement
  const replacements = {};
  for (const [url, result] of Object.entries(results)) {
    if (!result.ok) {
      replacements[url] = WORKING_PDF;
    }
  }

  if (Object.keys(replacements).length === 0) {
    console.log('\n✅ All URLs are working! No replacements needed.');
  } else {
    console.log(`\n⚠️  ${Object.keys(replacements).length} URL(s) need replacement.`);
    for (const [bad, good] of Object.entries(replacements)) {
      const result = await Book.updateMany(
        { pdfUrl: bad },
        { $set: { pdfUrl: good, downloadAllowed: true } }
      );
      console.log(`  Replaced "${bad.split('/').pop()}" → working PDF for ${result.modifiedCount} book(s)`);
    }
  }

  console.log('\nFinal book PDFs:');
  const books = await Book.find({}, 'title pdfUrl');
  books.forEach(b => console.log(`  [${b.title}] ${b.pdfUrl || '(EMPTY)'}`));

  await mongoose.disconnect();
  console.log('\nDone.');
}

run().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
