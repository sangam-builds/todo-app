const express = require('express');
const path = require('path');
const todosDb = require('./todos');

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.get('/api/todos', (req, res) => {
  res.json(todosDb.getAll());
});

app.post('/api/todos', (req, res) => {
  const { title } = req.body;
  if (!title || typeof title !== 'string' || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }
  const newTodo = todosDb.add(title.trim());
  res.status(201).json(newTodo);
});

app.put('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const { title, completed } = req.body;
  const updatedTodo = todosDb.update(id, { title, completed });
  if (!updatedTodo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.json(updatedTodo);
});

app.delete('/api/todos/:id', (req, res) => {
  const id = parseInt(req.params.id, 10);
  const deletedTodo = todosDb.delete(id);
  if (!deletedTodo) {
    return res.status(404).json({ error: 'Todo not found' });
  }
  res.json(deletedTodo);
});

module.exports = app;
