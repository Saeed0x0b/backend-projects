const express = require("express");
const fs = require("fs");

const app = express();

app.use(express.json());

const path = `${__dirname}/tasks.json`;

if (!fs.existsSync(path)) {
  fs.writeFileSync(path, JSON.stringify([]));
}

const tasks = JSON.parse(fs.readFileSync(path));

const createTask = (req, res) => {
  const newTask = {
    id: tasks.length,
    name: req.body.name,
    description: req.body.description || "",
    status: "todo",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  tasks.push(newTask);
  fs.writeFile(path, JSON.stringify(tasks), () => res.json(newTask), 2);
};

const updateTask = (req, res) => {
  const task = tasks.find((c) => c.id === parseInt(req.params.id));

  if (!task) return res.status(404).send("Task not found...");

  task.name = req.body.name || task.name;
  task.description = req.body.description || task.description;
  task.status = req.body.status || task.status;
  task.updatedAt = new Date().toISOString();

  fs.writeFile(path, JSON.stringify(tasks), () => res.json(task), 2);
};

const deleteTask = (req, res) => {
  const task = tasks.find((c) => c.id === parseInt(req.params.id));

  if (!task) return res.status(404).send("Task not found...");
  tasks.splice(parseInt(req.params.id), 1);

  fs.writeFile(path, JSON.stringify(tasks), () => res.json(tasks), 2);
};

const getAllTasks = (req, res) => {
  res.json(tasks);
};

const getTasksByStatus = (req, res) => {
  const filteredTasks = tasks.filter((c) => c.status === req.params.status);
  const validStatuses = ["todo", "done", "in-progress"];

  if (!validStatuses.includes(req.params.status))
    return res.status(404).send("Invalid status...");

  if (filteredTasks.length === 0) {
    res.send("No tasks found...");
  } else {
    res.json(filteredTasks);
  }
};

app.route("/").get(getAllTasks).post(createTask);
app.route("/:id").put(updateTask).delete(deleteTask);
app.route("/:status").get(getTasksByStatus);

const port = 3000;
app.listen(port);
