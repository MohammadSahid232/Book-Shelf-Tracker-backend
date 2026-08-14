const Goal = require('../models/goalModel');

// GET /api/goals
exports.getGoals = async (req, res) => {
  try {
    const filter = {};
    if (req.user && req.user.id) filter.user = req.user.id;

    const goals = await Goal.find(filter).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// POST /api/goals
exports.createGoal = async (req, res) => {
  try {
    const goalData = { ...req.body };
    if (req.user && req.user.id) goalData.user = req.user.id;

    const newGoal = await Goal.create(goalData);
    res.status(201).json(newGoal);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// PATCH /api/goals/:id
exports.updateGoal = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user && req.user.id) query.user = req.user.id;

    const updated = await Goal.findOneAndUpdate(query, req.body, { new: true, runValidators: true });
    if (!updated) return res.status(404).json({ message: 'Goal not found' });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// DELETE /api/goals/:id
exports.deleteGoal = async (req, res) => {
  try {
    const query = { _id: req.params.id };
    if (req.user && req.user.id) query.user = req.user.id;

    const goal = await Goal.findOneAndDelete(query);
    if (!goal) return res.status(404).json({ message: 'Goal not found' });
    res.status(200).json({ message: 'Goal deleted successfully', id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
