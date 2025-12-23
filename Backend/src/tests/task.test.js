const request = require('supertest');
const app = require('../../src/app');

// Mock API key for testing
const API_KEY = process.env.API_KEY || 'test_api_key_12345';

describe('Task API Integration Tests', () => {
  let createdTaskId;

  describe('POST /api/tasks', () => {
    test('should create a new task successfully', async () => {
      const taskData = {
        title: 'Schedule urgent meeting with team today',
        description: 'Discuss Q4 budget allocation with finance',
        assigned_to: 'John Doe',
        due_date: new Date(Date.now() + 86400000).toISOString() // Tomorrow
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('X-API-Key', API_KEY)
        .send(taskData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task).toHaveProperty('id');
      expect(response.body.data.task.title).toBe(taskData.title);
      expect(response.body.data.task.category).toBe('scheduling');
      expect(response.body.data.task.priority).toBe('high');
      expect(response.body.data.task).toHaveProperty('extracted_entities');
      expect(response.body.data.task).toHaveProperty('suggested_actions');

      // Save ID for later tests
      createdTaskId = response.body.data.task.id;
    });

    test('should fail without API key', async () => {
      const taskData = {
        title: 'Test task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .send(taskData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    test('should fail with invalid API key', async () => {
      const taskData = {
        title: 'Test task'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('X-API-Key', 'invalid_key')
        .send(taskData)
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should fail validation without title', async () => {
      const taskData = {
        description: 'Missing title'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('X-API-Key', API_KEY)
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
      expect(response.body.error.details).toBeDefined();
    });

    test('should fail with invalid due_date format', async () => {
      const taskData = {
        title: 'Test task',
        due_date: 'invalid-date'
      };

      const response = await request(app)
        .post('/api/tasks')
        .set('X-API-Key', API_KEY)
        .send(taskData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /api/tasks', () => {
    test('should retrieve all tasks', async () => {
      const response = await request(app)
        .get('/api/tasks')
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.tasks).toBeDefined();
      expect(Array.isArray(response.body.data.tasks)).toBe(true);
      expect(response.body.data.pagination).toBeDefined();
      expect(response.body.data.pagination).toHaveProperty('total');
      expect(response.body.data.pagination).toHaveProperty('limit');
      expect(response.body.data.pagination).toHaveProperty('offset');
    });

    test('should filter tasks by status', async () => {
      const response = await request(app)
        .get('/api/tasks?status=pending')
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(response.body.success).toBe(true);
      
      if (response.body.data.tasks.length > 0) {
        response.body.data.tasks.forEach(task => {
          expect(task.status).toBe('pending');
        });
      }
    });

    test('should filter tasks by category', async () => {
      const response = await request(app)
        .get('/api/tasks?category=scheduling')
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    test('should support pagination', async () => {
      const response = await request(app)
        .get('/api/tasks?limit=5&offset=0')
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.pagination.limit).toBe(5);
      expect(response.body.data.pagination.offset).toBe(0);
    });

    test('should fail with invalid limit', async () => {
      const response = await request(app)
        .get('/api/tasks?limit=500')
        .set('X-API-Key', API_KEY)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/tasks/:id', () => {
    test('should retrieve task by ID', async () => {
      if (!createdTaskId) {
        // Create a task first
        const createResponse = await request(app)
          .post('/api/tasks')
          .set('X-API-Key', API_KEY)
          .send({ title: 'Test task for retrieval' });
        
        createdTaskId = createResponse.body.data.task.id;
      }

      const response = await request(app)
        .get(`/api/tasks/${createdTaskId}`)
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task).toBeDefined();
      expect(response.body.data.task.id).toBe(createdTaskId);
      expect(response.body.data.history).toBeDefined();
      expect(Array.isArray(response.body.data.history)).toBe(true);
    });

    test('should return 404 for non-existent task', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .get(`/api/tasks/${fakeId}`)
        .set('X-API-Key', API_KEY)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    test('should fail with invalid UUID format', async () => {
      const response = await request(app)
        .get('/api/tasks/invalid-id')
        .set('X-API-Key', API_KEY)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /api/tasks/:id', () => {
    test('should update task successfully', async () => {
      if (!createdTaskId) {
        const createResponse = await request(app)
          .post('/api/tasks')
          .set('X-API-Key', API_KEY)
          .send({ title: 'Task to update' });
        
        createdTaskId = createResponse.body.data.task.id;
      }

      const updates = {
        status: 'in_progress',
        assigned_to: 'Jane Smith'
      };

      const response = await request(app)
        .patch(`/api/tasks/${createdTaskId}`)
        .set('X-API-Key', API_KEY)
        .send(updates)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.task.status).toBe('in_progress');
      expect(response.body.data.task.assigned_to).toBe('Jane Smith');
    });

    test('should return 404 for non-existent task', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .patch(`/api/tasks/${fakeId}`)
        .set('X-API-Key', API_KEY)
        .send({ status: 'completed' })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    test('should fail with no update fields', async () => {
      if (!createdTaskId) {
        const createResponse = await request(app)
          .post('/api/tasks')
          .set('X-API-Key', API_KEY)
          .send({ title: 'Task for empty update' });
        
        createdTaskId = createResponse.body.data.task.id;
      }

      const response = await request(app)
        .patch(`/api/tasks/${createdTaskId}`)
        .set('X-API-Key', API_KEY)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /api/tasks/:id', () => {
    test('should delete task successfully', async () => {
      // Create a task to delete
      const createResponse = await request(app)
        .post('/api/tasks')
        .set('X-API-Key', API_KEY)
        .send({ title: 'Task to delete' });
      
      const taskId = createResponse.body.data.task.id;

      const response = await request(app)
        .delete(`/api/tasks/${taskId}`)
        .set('X-API-Key', API_KEY)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Task deleted successfully');

      // Verify task is deleted
      await request(app)
        .get(`/api/tasks/${taskId}`)
        .set('X-API-Key', API_KEY)
        .expect(404);
    });

    test('should return 404 for non-existent task', async () => {
      const fakeId = '00000000-0000-0000-0000-000000000000';
      
      const response = await request(app)
        .delete(`/api/tasks/${fakeId}`)
        .set('X-API-Key', API_KEY)
        .expect(404);

      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /health', () => {
    test('should return health status', async () => {
      const response = await request(app)
        .get('/health')
        .expect(200);

      expect(response.body).toHaveProperty('status');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
    });
  });
});

afterAll(async () => {
  const db = require('../../src/config/database');

  // Close DB pool
  if (db?.pool) {
    await db.pool.end();
  }
});