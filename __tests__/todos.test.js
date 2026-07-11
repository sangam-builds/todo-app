import { jest } from '@jest/globals';

// 1. Setup mock functions for Prisma Client
const mockTodos = [
  { id: '1', title: 'Task One', completed: false, userId: null, deleted: false, createdAt: new Date() },
  { id: '2', title: 'Task Two', completed: true, userId: 'user-123', deleted: false, createdAt: new Date() }
];

const mockPrisma = {
  todo: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
  },
  user: {
    findUnique: jest.fn(),
  }
};

// Mock the database client module
jest.unstable_mockModule('../src/config/db.js', () => ({
  default: mockPrisma,
  connectDB: jest.fn()
}));

// Dynamically import the app and supertest after mocking db module
const { default: app } = await import('../src/app.js');
const { default: request } = await import('supertest');

describe('Todo API Endpoints (/api/todos)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/todos', () => {
    it('should return todos for anonymous user', async () => {
      mockPrisma.todo.findMany.mockResolvedValue([mockTodos[0]]);

      const res = await request(app)
        .get('/api/todos')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body[0].title).toBe('Task One');
      expect(mockPrisma.todo.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: { userId: null, deleted: false }
      }));
    });
  });

  describe('POST /api/todos', () => {
    it('should create a new todo anonymously', async () => {
      const newTodo = { id: '3', title: 'New Anonymous Task', completed: false, userId: null, deleted: false };
      mockPrisma.todo.create.mockResolvedValue(newTodo);

      const res = await request(app)
        .post('/api/todos')
        .send({ title: 'New Anonymous Task' })
        .expect(201);

      expect(res.body.title).toBe('New Anonymous Task');
      expect(res.body.userId).toBeNull();
      expect(mockPrisma.todo.create).toHaveBeenCalledWith({
        data: {
          title: 'New Anonymous Task',
          userId: null
        }
      });
    });

    it('should return 400 if title is missing', async () => {
      const res = await request(app)
        .post('/api/todos')
        .send({})
        .expect(400);

      expect(res.body.error).toBe('Title is required');
    });
  });

  describe('PUT /api/todos/:id', () => {
    it('should update todo status successfully', async () => {
      const updatedTodo = { id: 1, title: 'Task One', completed: true, userId: null, deleted: false };
      mockPrisma.todo.findUnique.mockResolvedValue({ id: 1, title: 'Task One', completed: false, userId: null });
      mockPrisma.todo.update.mockResolvedValue(updatedTodo);

      const res = await request(app)
        .put('/api/todos/1')
        .send({ completed: true })
        .expect(200);

      expect(res.body.completed).toBe(true);
      expect(mockPrisma.todo.update).toHaveBeenCalled();
    });
  });

  describe('DELETE /api/todos/:id', () => {
    it('should soft-delete todo successfully', async () => {
      const deletedTodo = { id: 1, title: 'Task One', completed: false, userId: null, deleted: true };
      mockPrisma.todo.findUnique.mockResolvedValue({ id: 1, title: 'Task One', completed: false, userId: null });
      mockPrisma.todo.update.mockResolvedValue(deletedTodo);

      const res = await request(app)
        .delete('/api/todos/1')
        .expect(200);

      expect(res.body.deleted).toBe(true);
      expect(mockPrisma.todo.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: 1 },
        data: expect.objectContaining({ deleted: true })
      }));
    });
  });
});
