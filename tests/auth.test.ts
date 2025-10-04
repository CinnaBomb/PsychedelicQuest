import "dotenv/config";
import { describe, test, expect, beforeAll } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import session from 'express-session';
import bcrypt from 'bcryptjs';
import { storage } from '../server/storage.js';

declare module "express-session" {
  interface SessionData {
    userId: number;
    username: string;
  }
}

// Create a test app
function createTestApp() {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));
  
  app.use(
    session({
      secret: 'test-secret',
      resave: false,
      saveUninitialized: false,
      cookie: {
        secure: false,
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24 * 7,
      },
    })
  );
  
  // Copy auth routes from server/routes.ts
  app.post("/api/auth/register", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      
      if (password.length < 6) {
        return res.status(400).json({ error: "Password must be at least 6 characters" });
      }
      
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "Username already exists" });
      }
      
      const hashedPassword = await bcrypt.hash(password, 10);
      
      const user = await storage.createUser({
        username,
        password: hashedPassword,
      });
      
      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.json({
        id: user.id,
        username: user.username,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (!username || !password) {
        return res.status(400).json({ error: "Username and password required" });
      }
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      const valid = await bcrypt.compare(password, user.password);
      if (!valid) {
        return res.status(401).json({ error: "Invalid username or password" });
      }
      
      req.session.userId = user.id;
      req.session.username = user.username;
      
      res.json({
        id: user.id,
        username: user.username,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });
  
  app.get("/api/auth/me", (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ error: "Not authenticated" });
    }
    
    res.json({
      id: req.session.userId,
      username: req.session.username,
    });
  });
  
  return app;
}

describe('Authentication API Tests', () => {
  let app: express.Application;
  const testUsername = `testuser_${Date.now()}`;
  const testPassword = 'password123';

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/auth/register', () => {
    test('Should register a new user with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: testUsername,
          password: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', testUsername);
      expect(response.body).not.toHaveProperty('password');
    });

    test('Should fail with missing username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          password: testPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    test('Should fail with missing password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser',
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });

    test('Should fail with short password', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: 'newuser2',
          password: '12345', // Only 5 characters
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('6 characters');
    });

    test('Should fail with duplicate username', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          username: testUsername, // Already exists
          password: testPassword,
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('already exists');
    });

    test('Should hash password (not store plain text)', async () => {
      const user = await storage.getUserByUsername(testUsername);
      expect(user).toBeDefined();
      expect(user!.password).not.toBe(testPassword);
      expect(user!.password).toMatch(/^\$2[ayb]\$.{56}$/); // bcrypt format
    });
  });

  describe('POST /api/auth/login', () => {
    test('Should login with correct credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUsername,
          password: testPassword,
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('username', testUsername);
    });

    test('Should fail with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUsername,
          password: 'wrongpassword',
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid');
    });

    test('Should fail with non-existent user', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          username: 'nonexistentuser',
          password: testPassword,
        });

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Invalid');
    });

    test('Should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({});

      expect(response.status).toBe(400);
      expect(response.body.error).toContain('required');
    });
  });

  describe('GET /api/auth/me', () => {
    test('Should return user info when logged in', async () => {
      // First login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          username: testUsername,
          password: testPassword,
        });

      const cookies = loginResponse.headers['set-cookie'];

      // Then check /me endpoint
      const response = await request(app)
        .get('/api/auth/me')
        .set('Cookie', cookies);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('username', testUsername);
    });

    test('Should fail when not logged in', async () => {
      const response = await request(app)
        .get('/api/auth/me');

      expect(response.status).toBe(401);
      expect(response.body.error).toContain('Not authenticated');
    });
  });

  describe('Database Integration', () => {
    test('Registered user should exist in database', async () => {
      const user = await storage.getUserByUsername(testUsername);
      expect(user).toBeDefined();
      expect(user!.username).toBe(testUsername);
    });

    test('Can retrieve user by ID', async () => {
      const userByUsername = await storage.getUserByUsername(testUsername);
      const userById = await storage.getUser(userByUsername!.id);
      
      expect(userById).toBeDefined();
      expect(userById!.id).toBe(userByUsername!.id);
      expect(userById!.username).toBe(testUsername);
    });
  });
});
