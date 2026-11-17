const express = require("express");

const app = express();
const PORT = 3001;

app.use(express.json());

let notifications = [];
let nextId = 1;

// Health check
app.get("/health", (req, res) => {
    res.status(200).json({
        status: "healthy",
        service: "notifications"
    });
});

// Get all notifications
app.get("/api/notifications", (req, res) => {
    res.json(notifications);
});

// Create a notification
app.post("/api/notifications", (req, res) => {
    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.status(400).json({
            error: "Notification message is required"
        });
    }

    const notification = {
        id: nextId++,
        message: message.trim(),
        createdAt: new Date().toISOString()
    };

    notifications.push(notification);

    res.status(201).json(notification);
});

// Start server
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Notifications service running on port ${PORT}`);
});
