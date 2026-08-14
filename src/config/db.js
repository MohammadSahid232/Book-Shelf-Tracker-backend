const mongoose = require('mongoose');
require('dotenv').config();
const seedDatabase = require('./seed');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.warn('⚠️ MONGO_URI not set in .env. Skipping database connection.');
      return;
    }
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB Atlas Connected Successfully!');
    await seedDatabase();
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err.message);
  }
};

module.exports = connectDB;
