const TaskService = require('../services/taskService');
const ResponseHandler = require('../utils/responseHandler');
const { NotFoundError } = require('../middlewares/errorHandler');
const logger = require('../config/logger');

/**
 * Task Controller - Handles HTTP requests
 */
class TaskController {
  /**
   * Create a new task
   * POST /api/tasks
   */
  static async createTask(req, res, next) {
    try {
      const taskData = req.body;
      
      logger.info('Creating new task', { 
        title: taskData.title,
        ip: req.ip 
      });

      const task = await TaskService.createTask(taskData);

      return ResponseHandler.created(
        res,
        { task },
        'Task created successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all tasks with filters
   * GET /api/tasks
   */
  static async getAllTasks(req, res, next) {
    try {
      const filters = req.query;
      
      logger.info('Retrieving tasks', { filters });

      const result = await TaskService.getAllTasks(filters);

      return ResponseHandler.paginated(
        res,
        { tasks: result.tasks },
        result.pagination
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get task by ID
   * GET /api/tasks/:id
   */
  static async getTaskById(req, res, next) {
    try {
      const { id } = req.params;
      
      logger.info('Retrieving task by ID', { taskId: id });

      const result = await TaskService.getTaskById(id);

      if (!result) {
        throw new NotFoundError(`Task with ID ${id} not found`);
      }

      return ResponseHandler.success(res, result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update task
   * PATCH /api/tasks/:id
   */
  static async updateTask(req, res, next) {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      logger.info('Updating task', { 
        taskId: id, 
        updates: Object.keys(updates) 
      });

      const task = await TaskService.updateTask(id, updates);

      if (!task) {
        throw new NotFoundError(`Task with ID ${id} not found`);
      }

      return ResponseHandler.success(
        res,
        { task },
        'Task updated successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete task
   * DELETE /api/tasks/:id
   */
  static async deleteTask(req, res, next) {
    try {
      const { id } = req.params;
      
      logger.info('Deleting task', { taskId: id });

      const result = await TaskService.deleteTask(id);

      if (!result) {
        throw new NotFoundError(`Task with ID ${id} not found`);
      }

      return ResponseHandler.success(
        res,
        null,
        'Task deleted successfully'
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get task statistics
   * GET /api/tasks/stats
   */
  static async getStatistics(req, res, next) {
    try {
      logger.info('Retrieving task statistics');

      const stats = await TaskService.getStatistics();

      return ResponseHandler.success(res, { statistics: stats });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = TaskController;