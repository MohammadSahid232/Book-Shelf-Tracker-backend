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

// 6. SUMMARIZE a task with Gemini AI — detailed, unique on every call
exports.summarizeTask = async (req, res) => {
    try {
        const task = req.body;
        if (!task || !task.title || !task.description) {
            return res.status(400).json({ error: 'Task title and description are required' });
        }

        const { generateContent } = require('../services/GeminiService');

        // Rotating perspective angles — cycles every second so each call uses a fresh angle
        const perspectives = [
            'as a senior project manager writing a detailed status report for stakeholders',
            'as a productivity coach analyzing this task for a team retrospective session',
            'as a technical writer documenting this work item for a product changelog',
            'as a business analyst evaluating the business impact and scope of this deliverable',
            'as a team lead preparing this summary for a daily standup meeting',
            'as a strategic planner reviewing milestones and identifying next steps',
            'as a scrum master writing release notes for the sprint review',
            'as an executive assistant condensing this task into an executive briefing',
        ];

        // Rotate perspective based on current second for variety on each call
        const angle = perspectives[new Date().getSeconds() % perspectives.length];
        const statusLabel = task.completed ? 'Completed ✅' : 'Currently Pending ⏳';
        const priorityInfo = task.priority ? `\nPriority Level: ${task.priority.toUpperCase()}` : '';

        const prompt = `You are ${angle}.

Here is the task you must analyze and summarize in detail:

━━━━━━━━━━━━━━━━━━━━━━━━
Task Title: "${task.title}"
Description: "${task.description}"
Status: ${statusLabel}${priorityInfo}
━━━━━━━━━━━━━━━━━━━━━━━━

Write a rich, detailed summary of this task in 3 to 5 well-crafted sentences. Your summary must:
1. Clearly explain what this task involves and why it matters
2. Comment on its current status and what that implies for the overall project
3. Highlight any key considerations, risks, or dependencies worth noting
4. Describe what a successful outcome would look like

Rules:
- Write in flowing, professional prose — NO bullet points
- Each time you summarize this task, vary your opening sentence so it sounds fresh
- Do not start with the exact task title as the first word
- Be specific and insightful, not generic
- Keep the tone confident and informative`;

        const response = await generateContent(prompt);

        res.json({ summary: response });
    } catch (error) {
        console.error('Gemini summarize error:', error.message || error);
        res.status(500).json({ error: 'Failed to summarize task' });
    }
};
