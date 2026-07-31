const Task = require('../models/taskModel');

// 1. CREATE a new task (POST)
exports.createTask = async (req, res) => {
    try {
        const taskData = { ...req.body };
        // Map name to title for backward compatibility
        if (taskData.name && !taskData.title) {
            taskData.title = taskData.name;
        }
        const task = await Task.create(taskData);
        res.status(201).json(task);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

// 2. READ all tasks (GET)
exports.getAllTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. READ a single task (GET)
exports.getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.status(200).json(task);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(500).json({ error: err.message });
    }
};

// 4. UPDATE a task (PUT)
exports.updateTask = async (req, res) => {
    try {
        const taskData = { ...req.body };
        // Map name to title for backward compatibility
        if (taskData.name && !taskData.title) {
            taskData.title = taskData.name;
        }
        const task = await Task.findByIdAndUpdate(req.params.id, taskData, { new: true, runValidators: true });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.status(200).json(task);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(400).json({ error: err.message });
    }
};

// 5. DELETE a task (DELETE)
exports.deleteTask = async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.status(204).send();
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(404).json({ error: 'Task not found' });
        }
        res.status(500).json({ error: err.message });
    }
};
