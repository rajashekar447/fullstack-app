const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());

let tasks = [];
let nextId = 1;

// Get all tasks
app.get("/api/tasks", (req, res) => {
    res.json(tasks);
});

// Add a new task
app.post("/api/tasks", (req, res) => {
    const { title } = req.body;

    if (!title || !title.trim()) {
        return res.status(400).json({
            error: "Task title is required"
        });
    }

    const task = {
        id: nextId++,
        title: title.trim(),
        completed: false
    };

    tasks.push(task);

    res.status(201).json(task);
});

// Mark a task as completed
app.patch("/api/tasks/:id", (req, res) => {
    const task = tasks.find(
        t => t.id === Number(req.params.id)
    );

    if (!task) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    task.completed = !task.completed;

    res.json(task);
});

// Delete a task
app.delete("/api/tasks/:id", (req, res) => {
    const id = Number(req.params.id);

    const exists = tasks.some(t => t.id === id);

    if (!exists) {
        return res.status(404).json({
            error: "Task not found"
        });
    }

    tasks = tasks.filter(t => t.id !== id);

    res.json({
        message: "Task deleted successfully"
    });
});

// Start the server
app.listen(PORT, "127.0.0.1", () => {
    console.log(`Backend running on port ${PORT}`);
});
