const mongoose = require('mongoose'); 

const TaskSchema = new mongoose.Schema({ 
    title: { 
        type: String, 
        required: [true, 'Please add a task title'], 
        trim: true, 
        maxlength: [100, 'Title cannot be more than 100 characters'] 
    }, 
    description: { 
        type: String, 
        trim: true, 
        default: '' 
    }, 
    priority: { 
        type: String, 
        enum: ['low', 'medium', 'high'], 
        default: 'medium' 
    }, 
    completed: { 
        type: Boolean, 
        default: false 
    } 
}, { 
    // Automatically creates 'createdAt' and 'updatedAt' fields 
    timestamps: true  
}); 

// Configure Schema to serialize virtual 'id' into JSON
TaskSchema.set('toJSON', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

// Configure Schema to serialize virtual 'id' into Object
TaskSchema.set('toObject', {
    virtuals: true,
    transform: (doc, ret) => {
        delete ret._id;
        delete ret.__v;
        return ret;
    }
});

module.exports = mongoose.model('Task', TaskSchema); 
