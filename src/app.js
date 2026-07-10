const express = require('express');
const cors = require('cors');
const taskRoutes = require('./routes/taskRoutes');
const bookRoutes = require('./routes/bookRoutes');
const { registerRules, validate } = require('./validators/registrationValidators');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mount the task routes at the /tasks prefix
app.use('/tasks', taskRoutes);

// Mount the book routes at the /api/books prefix
app.use('/api/books', bookRoutes);

// Apply the validation rules followed by the error checker middleware for registration
app.post('/api/register', registerRules, validate, (req, res) => {
    // If the code gets here, the data is completely valid and sanitized!
    const { firstName, lastName, email } = req.body;
    console.log('Valid and cleaned data:', { firstName, lastName, email });
    return res.status(201).json({ message: 'Registration successful!' });
});

module.exports = app;
