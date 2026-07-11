import { jest } from '@jest/globals';
import jwt from 'jsonwebtoken';

// 1. Mock DB module
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    upsert: jest.fn(),
  }
};

jest.unstable_mockModule('../src/config/db.js', () => ({
  default: mockPrisma,
  connectDB: jest.fn()
}));

// Dynamically import app & supertest
const { default: app } = await import('../src/app.js');
const { default: request } = await import('supertest');

const JWT_SECRET = process.env.JWT_SECRET || 'placeholder-jwt-session-secret-key-32-chars-long';

describe('Auth API Endpoints (/api/auth)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/auth/me', () => {
    it('should return authenticated false if token cookie is absent', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.authenticated).toBe(false);
      expect(res.body.user).toBeUndefined();
    });

    it('should return authenticated true and user details if valid token is provided', async () => {
      const userPayload = { id: 'user-123', email: 'test@example.com', name: 'Test User' };
      const token = jwt.sign(userPayload, JWT_SECRET, { expiresIn: '1h' });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${token}`])
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body.authenticated).toBe(true);
      expect(res.body.user.email).toBe('test@example.com');
      expect(res.body.user.id).toBe('user-123');
    });

    it('should return authenticated false if token is expired or malformed', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', ['token=invalid-malformed-token-string'])
        .expect(200);

      expect(res.body.authenticated).toBe(false);
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should clear cookies and return success on logout', async () => {
      const res = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      // Verify cookie header has clearCookie directive
      const cookieHeader = res.headers['set-cookie'] || [];
      expect(cookieHeader.some(c => c.includes('token=;'))).toBe(true);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe('Successfully logged out');
    });
  });

  describe('GET /api/auth/google', () => {
    it('should redirect to Google OAuth login screen', async () => {
      const res = await request(app)
        .get('/api/auth/google')
        .expect(302);

      // Verify that it redirects to accounts.google.com
      expect(res.headers.location).toContain('accounts.google.com');
    });
  });
});
