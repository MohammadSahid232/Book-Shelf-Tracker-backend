const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a book title'],
        trim: true
    },
    author: {
        type: String,
        trim: true,
        default: 'Unknown Author'
    },
    status: {
        type: String,
        enum: ['want to read', 'reading', 'finished'],
        default: 'want to read'
    },
    rating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [5, 'Rating cannot be more than 5'],
        default: null
    }
}, {
    timestamps: true
});

// Configure Schema to serialize virtual 'id' into JSON
BookSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

// Configure Schema to serialize virtual 'id' into Object
BookSchema.set('toObject', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Book', BookSchema);
