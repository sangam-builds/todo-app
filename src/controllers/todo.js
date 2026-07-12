import prisma from '../config/db.js';

// @desc    Get all todos
// @route   GET /api/todos
// @access  Public
export const getTodos = async (req, res) => {
  try {
    const userId = req.user ? req.user.id : null;
    const todos = await prisma.todo.findMany({
      where: { userId, deleted: false },
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
    const { title, deadline, priority, addToCalendar } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const userId = req.user ? req.user.id : null;
    
    // Parse inputs
    const parsedDeadline = deadline ? new Date(deadline) : null;
    const validatedPriority = ['LOW', 'MEDIUM', 'HIGH'].includes(String(priority).toUpperCase()) 
      ? String(priority).toUpperCase() 
      : 'MEDIUM';
    const parsedAddToCalendar = Boolean(addToCalendar);

    const googleProviderToken = req.headers['x-google-provider-token'];
    let calendarEventId = null;

    if (parsedAddToCalendar && parsedDeadline && googleProviderToken) {
      try {
        const calendarResponse = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${googleProviderToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            summary: `TaskFlow: ${title.trim()}`,
            description: `Priority: ${validatedPriority}\nCreated via TaskFlow Premium Todo Dashboard`,
            start: {
              dateTime: parsedDeadline.toISOString(),
              timeZone: 'UTC'
            },
            end: {
              dateTime: new Date(parsedDeadline.getTime() + 60 * 60 * 1000).toISOString(),
              timeZone: 'UTC'
            },
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 15 },
                { method: 'email', minutes: 30 }
              ]
            }
          })
        });

        if (calendarResponse.ok) {
          const calendarData = await calendarResponse.json();
          calendarEventId = calendarData.id;
          console.log(`Successfully synced event to Google Calendar: ${calendarEventId}`);
        } else {
          const errText = await calendarResponse.text();
          console.error(`Google Calendar API error (status ${calendarResponse.status}): ${errText}`);
        }
      } catch (err) {
        console.error('Failed to sync to Google Calendar:', err.message);
      }
    }

    const newTodo = await prisma.todo.create({
      data: {
        title: title.trim(),
        userId,
        deadline: parsedDeadline,
        priority: validatedPriority,
        addToCalendar: parsedAddToCalendar,
        calendarEventId
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

    // Find the todo first to check ownership
    const todo = await prisma.todo.findUnique({
      where: { id }
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const currentUserId = req.user ? req.user.id : null;
    if (todo.userId !== currentUserId) {
      return res.status(403).json({ error: 'Access denied: You do not own this task.' });
    }

    const data = {};
    if (title !== undefined) data.title = title.trim();
    if (completed !== undefined) {
      data.completed = completed;
      data.completedAt = completed ? new Date() : null;
    }

    const updatedTodo = await prisma.todo.update({
      where: { id },
      data
    });
    res.status(200).json(updatedTodo);
  } catch (error) {
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

    // Find the todo first to check ownership
    const todo = await prisma.todo.findUnique({
      where: { id }
    });

    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }

    const currentUserId = req.user ? req.user.id : null;
    if (todo.userId !== currentUserId) {
      return res.status(403).json({ error: 'Access denied: You do not own this task.' });
    }

    const deletedTodo = await prisma.todo.update({
      where: { id },
      data: {
        deleted: true,
        deletedAt: new Date()
      }
    });

    res.status(200).json(deletedTodo);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server Error' });
  }
};

export const getTodoHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    // Get all user's todos (including soft-deleted and completed) directly from DB
    const history = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });
    
    res.status(200).json(history);
  } catch (error) {
    res.status(500).json({ error: error.message || 'Server Error' });
  }
};
