const { body, validationResult } = require('express-validator');

// 1. Define the validation rules (synchronized with actual frontend fields)
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

// 2. Middleware to catch validation errors and return them
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (errors.isEmpty()) {
        return next(); // No errors? Move to the actual route handler
    }
    return res.status(400).json({ errors: errors.array() });
};

module.exports = {
    registerRules: registerValidationRules,
    validate
};
