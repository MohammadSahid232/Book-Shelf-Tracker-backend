const TaskModel = require('../models/taskModel');

exports.getAllTasks = (req, res) => {
    const tasks = TaskModel.getAll();
    res.status(200).json(tasks);
};

exports.getTaskById = (req, res) => {
    const id = parseInt(req.params.id);
    const task = TaskModel.getById(id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(task);
};

exports.createTask = (req, res) => {
    if (!req.body.name) {
        return res.status(400).json({ message: 'Task name is required' });
    }
    const newTask = TaskModel.create(req.body.name);
    res.status(201).json(newTask);
};

exports.updateTask = (req, res) => {
    const id = parseInt(req.params.id);
    const updatedTask = TaskModel.update(id, req.body);
    if (!updatedTask) return res.status(404).json({ message: 'Task not found' });
    res.status(200).json(updatedTask);
};

exports.deleteTask = (req, res) => {
    const id = parseInt(req.params.id);
    const success = TaskModel.delete(id);
    if (!success) return res.status(404).json({ message: 'Task not found' });
    res.status(204).send();
};
