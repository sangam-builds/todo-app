import prisma from '../config/db.js';
import { OAuth2Client } from 'google-auth-library';

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
    const { title } = req.body;
    if (!title || typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'Title is required' });
    }

    const userId = req.user ? req.user.id : null;
    const newTodo = await prisma.todo.create({
      data: {
        title: title.trim(),
        userId
      }
    });


    // If user is authenticated, query their OAuth tokens and create calendar event
    if (userId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: userId }
        });

        if (user && user.accessToken) {
          const oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_CALLBACK_URL
          );
          oauth2Client.setCredentials({
            access_token: user.accessToken,
            refresh_token: user.refreshToken,
          });

          // Create event on user's primary Google Calendar
          const response = await oauth2Client.request({
            url: 'https://www.googleapis.com/calendar/v3/calendars/primary/events',
            method: 'POST',
            data: {
              summary: newTodo.title,
              description: 'Created automatically via TaskFlow Todo Dashboard',
              start: {
                dateTime: new Date().toISOString(),
              },
              end: {
                dateTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour duration
              }
            }
          });
          
          const calendarEventId = response.data?.id;
          if (calendarEventId) {
            await prisma.todo.update({
              where: { id: newTodo.id },
              data: { calendarEventId }
            });
            newTodo.calendarEventId = calendarEventId;
          }
          console.log(`Successfully created Google Calendar event for: "${newTodo.title}"`);
        }
      } catch (calendarError) {
        console.error('Failed to create Google Calendar event:', calendarError.message);
      }
    }

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

    // If the todo has an associated Google Calendar event, update the event status
    if (updatedTodo.calendarEventId && currentUserId) {
      try {
        const user = await prisma.user.findUnique({
          where: { id: currentUserId }
        });

        if (user && user.accessToken) {
          const oauth2Client = new OAuth2Client(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_CALLBACK_URL
          );
          oauth2Client.setCredentials({
            access_token: user.accessToken,
            refresh_token: user.refreshToken,
          });

          // Determine the updated event title and color
          let newSummary = updatedTodo.title;
          let colorId = null;

          if (updatedTodo.completed) {
            newSummary = `✔ ${updatedTodo.title}`;
            colorId = '8'; // Graphite (Gray)
          } else {
            // Remove checkmark prefix if marking back to pending
            if (newSummary.startsWith('✔ ')) {
              newSummary = newSummary.substring(2);
            }
          }

          await oauth2Client.request({
            url: `https://www.googleapis.com/calendar/v3/calendars/primary/events/${updatedTodo.calendarEventId}`,
            method: 'PATCH',
            data: {
              summary: newSummary,
              colorId: colorId
            }
          });
          console.log(`Successfully updated Google Calendar event status for: "${updatedTodo.title}"`);
        }
      } catch (calendarError) {
        console.error('Failed to update Google Calendar event status:', calendarError.message);
      }
    }

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
