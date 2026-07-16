const app = require('./src/app');
const mongoose = require('mongoose');
require('dotenv').config();

const port = process.env.PORT || 5000;

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');
    } catch (err) {
        console.error('Connection Failed:', err.message);
        process.exit(1);
    }
};

connectDB();

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
