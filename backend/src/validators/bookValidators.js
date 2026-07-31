const { body, validationResult } = require('express-validator');

// Validation rules for books
const bookValidationRules = [
    body('title')
        .custom((value, { req }) => {
            if (req.method === 'POST' && (!value || value.trim() === '')) {
                throw new Error('Title is required');
            }
            if (value !== undefined && value.trim() === '') {
                throw new Error('Title cannot be empty');
            }
            return true;
        }),
    body('author')
        .optional()
        .trim(),
    body('genre')
        .optional()
        .trim(),
    body('status')
        .optional()
        .isIn(['want to read', 'reading', 'finished'])
        .withMessage('Status must be one of: want to read, reading, finished'),
    body('rating')
        .optional()
        .custom((value) => {
            if (value === null) return true;
            const valInt = parseInt(value, 10);
            if (isNaN(valInt) || valInt < 1 || valInt > 5) {
                throw new Error('Rating must be an integer between 1 and 5');
            }
            return true;
        }),
    body('review')
        .optional()
        .trim(),
    body('userId')
        .optional()
        .trim()
];

// Validation rules for registering a user
const registerValidationRules = [
    body('email')
        .trim()
        .isEmail().withMessage('Please provide a valid email address'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords do not match');
            }
            return true;
        })
];

// Middleware to catch validation errors and return them
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next(); // No errors? Move to the actual route handler
    }
    return res.status(400).json({ errors: errors.array() });
};

module.exports = {
    bookRules: bookValidationRules,
    registerRules: registerValidationRules,
    validate
};
