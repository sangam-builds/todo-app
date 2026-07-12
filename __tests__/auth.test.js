import { jest } from '@jest/globals';

process.env.SUPABASE_URL = 'https://mock-supabase-url.supabase.co';
process.env.SUPABASE_ANON_KEY = 'mock-supabase-anon-key-jwt-token-string';

// 1. Mock Supabase Client JS library
const mockSupabaseClient = {
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
  }
};

jest.unstable_mockModule('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabaseClient)
}));

// 2. Mock DB module
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  $executeRaw: jest.fn()
};

jest.unstable_mockModule('../src/config/db.js', () => ({
  default: mockPrisma,
  connectDB: jest.fn()
}));

// Dynamically import app & supertest after mocking modules
const { default: app } = await import('../src/app.js');
const { default: request } = await import('supertest');

describe('Auth API & Security Layer (Supabase Integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /api/auth/config', () => {
    it('should return public Supabase credentials', async () => {
      const res = await request(app)
        .get('/api/auth/config')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(res.body).toHaveProperty('supabaseUrl');
      expect(res.body).toHaveProperty('supabaseAnonKey');
    });
  });

  describe('GET /app (Security Redirects)', () => {
    it('should serve app.html shell for unauthenticated page loads (client-side JS handles redirection)', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });

      const res = await request(app)
        .get('/app')
        .expect(200);

      expect(res.text).toContain('<!DOCTYPE html>');
    });

    it('should serve app.html and auto-sync user profile to local DB on valid token', async () => {
      const mockUser = {
        id: 'supabase-uuid-123',
        email: 'test@example.com',
        user_metadata: { name: 'Supabase User' }
      };

      // Mock Supabase getUser to return valid user profile
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      
      // Mock local DB check to simulate a new user who is not registered locally yet
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: mockUser.id,
        email: mockUser.email,
        name: 'Supabase User'
      });

      const res = await request(app)
        .get('/app')
        .set('Cookie', ['sb-access-token=mock-valid-jwt-token'])
        .expect(200);

      expect(res.text).toContain('<!DOCTYPE html>');
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: mockUser.id }
      });
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should migrate user ID when a user with the same email already exists under a different ID', async () => {
      const mockUser = {
        id: 'supabase-uuid-123',
        email: 'existing@example.com',
        user_metadata: { name: 'Supabase User' }
      };

      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: mockUser }, error: null });
      
      // Mock findUnique sequentially: 
      // 1. Check user by id -> null
      // 2. Check user by email -> old user
      // 3. Check user by id (post-migration) -> migrated user
      mockPrisma.user.findUnique
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce({ id: 'old-cuid-123', email: 'existing@example.com', name: 'Old User' })
        .mockResolvedValueOnce({ id: mockUser.id, email: mockUser.email, name: 'Supabase User' });

      mockPrisma.$executeRaw.mockResolvedValue(1);

      const res = await request(app)
        .get('/app')
        .set('Cookie', ['sb-access-token=mock-valid-jwt-token'])
        .expect(200);

      expect(res.text).toContain('<!DOCTYPE html>');
      expect(mockPrisma.$executeRaw).toHaveBeenCalled();
    });
  });
});
