const app = require('./src/app');
const connectDB = require('./src/config/db');
require('dotenv').config();

const port = process.env.PORT || 5000;

connectDB();

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
