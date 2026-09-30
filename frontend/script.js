const API_URL = "/api/tasks";

// Load tasks when the page opens
document.addEventListener("DOMContentLoaded", loadTasks);

// Get all tasks from the backend
async function loadTasks() {
    try {
        const response = await fetch(API_URL);
        const tasks = await response.json();

        displayTasks(tasks);
    } catch (error) {
        console.error("Error loading tasks:", error);
    }
}

// Display tasks on the page
function displayTasks(tasks) {
    const taskList = document.getElementById("taskList");

    taskList.innerHTML = "";

    tasks.forEach(task => {
        const li = document.createElement("li");

        const taskText = document.createElement("span");
        taskText.textContent = task.title;

        if (task.completed) {
            taskText.classList.add("completed");
        }

        taskText.onclick = () => toggleTask(task.id);

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.classList.add("delete-btn");

        deleteButton.onclick = () => deleteTask(task.id);

        li.appendChild(taskText);
        li.appendChild(deleteButton);

        taskList.appendChild(li);
    });
}

// Add a new task
async function addTask() {
    const input = document.getElementById("taskInput");
    const title = input.value.trim();

    if (!title) {
        alert("Please enter a task.");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title: title
            })
        });

        if (!response.ok) {
            throw new Error("Failed to add task");
        }

        input.value = "";

        loadTasks();
    } catch (error) {
        console.error("Error adding task:", error);
    }
}

// Toggle task completion
async function toggleTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "PATCH"
        });

        if (!response.ok) {
            throw new Error("Failed to update task");
        }

        loadTasks();
    } catch (error) {
        console.error("Error updating task:", error);
    }
}

// Delete a task
async function deleteTask(id) {
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        });

        if (!response.ok) {
            throw new Error("Failed to delete task");
        }

        loadTasks();
    } catch (error) {
        console.error("Error deleting task:", error);
    }
}
