const express = require('express');
const TaskController = require('../controllers/taskController');
const validate = require('../middlewares/validator');
const { z } = require('zod');
const { authenticate } = require('../middlewares/auth');
const { asyncHandler } = require('../middlewares/errorHandler');
const {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
  uuidSchema
} = require('../schemas/taskSchema');

const router = express.Router();

/**
 * Apply authentication middleware to all routes
 */
router.use(authenticate);

/**
 * @route   GET /api/tasks/stats
 * @desc    Get task statistics
 * @access  Private
 */
router.get(
  '/stats',
  asyncHandler(TaskController.getStatistics)
);

/**
 * @route   POST /api/tasks
 * @desc    Create a new task
 * @access  Private
 */
router.post(
  '/',
  validate(createTaskSchema, 'body'),
  asyncHandler(TaskController.createTask)
);

/**
 * @route   GET /api/tasks
 * @desc    Get all tasks with filters
 * @access  Private
 */
router.get(
  '/',
  validate(listTasksQuerySchema, 'query'),
  asyncHandler(TaskController.getAllTasks)
);

/**
 * @route   GET /api/tasks/:id
 * @desc    Get task by ID
 * @access  Private
 */
router.get(
  '/:id',
  validate(z.object({ id: uuidSchema }), 'params'),
  asyncHandler(TaskController.getTaskById)
);

/**
 * @route   PATCH /api/tasks/:id
 * @desc    Update task
 * @access  Private
 */
router.patch(
  '/:id',
  validate(z.object({ id: uuidSchema }), 'params'),
  validate(updateTaskSchema, 'body'),
  asyncHandler(TaskController.updateTask)
);

/**
 * @route   DELETE /api/tasks/:id
 * @desc    Delete task
 * @access  Private
 */
router.delete(
  '/:id',
  validate(z.object({ id: uuidSchema }), 'params'),
  asyncHandler(TaskController.deleteTask)
);

module.exports = router;