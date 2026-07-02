import prisma from '../config/db.js';

// @desc    Get all todos
// @route   GET /api/todos
// @access  Public
export const getTodos = async (req, res) => {
  try {
    const todos = await prisma.todo.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server Error' });
  }
};

// @desc    Create a todo
// @route   POST /api/todos
// @access  Public
export const createTodo = async (req, res) => {
  try {
    const { title } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const newTodo = await prisma.todo.create({
      data: {
        title: title.trim()
      }
    });

    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server Error' });
  }
};

// @desc    Update a todo
// @route   PUT /api/todos/:id
// @access  Public
export const updateTodo = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { title, completed } = req.body;

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (completed !== undefined) data.completed = completed;

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data
    });

    res.status(200).json(updatedTodo);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(500).json({ error: error.message || 'Server Error' });
  }
};

// @desc    Delete a todo
// @route   DELETE /api/todos/:id
// @access  Public
export const deleteTodo = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid task ID format' });
    }

    const deletedTodo = await prisma.todo.delete({
      where: { id }
    });

    res.status(200).json(deletedTodo);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.status(500).json({ error: error.message || 'Server Error' });
  }
};
