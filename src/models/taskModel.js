let tasks = [
    { id: 1, name: 'Review Node.js Tutorial', completed: false },
    { id: 2, name: 'Implement Task API', completed: true }
];

let nextId = 3;

// Exporting data helper methods
module.exports = {
    getAll: () => tasks,

    getById: (id) => tasks.find(t => t.id === id),

    create: (name) => {
        const newTask = { id: nextId++, name, completed: false };
        tasks.push(newTask);
        return newTask;
    },

    update: (id, updates) => {
        const task = tasks.find(t => t.id === id);
        if (!task) return null;
        if (updates.name !== undefined) task.name = updates.name;
        if (updates.completed !== undefined) task.completed = updates.completed;
        return task;
    },

    delete: (id) => {
        const index = tasks.findIndex(t => t.id === id);
        if (index === -1) return false;
        tasks.splice(index, 1);
        return true;
    }
};
