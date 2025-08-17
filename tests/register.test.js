// Unit tests for registration functionality
const fetch = require('node-fetch');

// Mock environment variables
process.env.FIREBASE_API_KEY = 'test-api-key';
process.env.FIREBASE_PROJECT_ID = 'test-project';

// Import the handler
const handler = require('../api/register');

// Mock fetch globally
global.fetch = jest.fn();

describe('Registration API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/register', () => {
    test('should create new user and save registration data', async () => {
      // Mock successful user creation
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          localId: 'test-user-id',
          idToken: 'test-token'
        })
      });

      // Mock successful Firestore save
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          name: 'projects/test/databases/(default)/documents/registrations/test-doc-id'
        })
      });

      const req = {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123',
          sotu: '010190-123A',
          zip: '00100',
          plate: 'ABC-123',
          homeSize: '75',
          consentStore: true,
          consentMarketing: false,
          consentSale: false
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn()
      };

      await handler(req, res);

      expect(global.fetch).toHaveBeenCalledTimes(2);
      
      // Check user creation call
      expect(global.fetch).toHaveBeenNthCalledWith(1,
        expect.stringContaining('accounts:signUp'),
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('test@example.com')
        })
      );

      // Check Firestore save call
      expect(global.fetch).toHaveBeenNthCalledWith(2,
        expect.stringContaining('firestore.googleapis.com'),
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: 'Registration saved successfully',
        id: 'test-doc-id'
      });
    });

    test('should return 400 if email already exists', async () => {
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: {
            message: 'EMAIL_EXISTS'
          }
        })
      });

      const req = {
        method: 'POST',
        body: {
          email: 'existing@example.com',
          password: 'password123',
          sotu: '010190-123A',
          zip: '00100',
          plate: 'ABC-123',
          homeSize: '75',
          consentStore: true,
          consentMarketing: false,
          consentSale: false
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn()
      };

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Sähköpostiosoite on jo rekisteröity'
      });
    });

    test('should return 400 if required fields are missing', async () => {
      const req = {
        method: 'POST',
        body: {
          email: 'test@example.com',
          // Missing password and other fields
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn()
      };

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Missing required fields'
      });
    });

    test('should return 405 for non-POST requests', async () => {
      const req = {
        method: 'GET'
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn()
      };

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(405);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Method not allowed'
      });
    });

    test('should handle Firestore save failure', async () => {
      // Mock successful user creation
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          localId: 'test-user-id',
          idToken: 'test-token'
        })
      });

      // Mock failed Firestore save
      global.fetch.mockResolvedValueOnce({
        ok: false,
        json: async () => ({
          error: 'Firestore error'
        })
      });

      const req = {
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'password123',
          sotu: '010190-123A',
          zip: '00100',
          plate: 'ABC-123',
          homeSize: '75',
          consentStore: true,
          consentMarketing: false,
          consentSale: false
        }
      };

      const res = {
        status: jest.fn().mockReturnThis(),
        json: jest.fn(),
        setHeader: jest.fn()
      };

      await handler(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: 'Failed to save registration'
      });
    });
  });
});