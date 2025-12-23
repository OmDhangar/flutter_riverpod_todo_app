const TaskModel = require('../models/taskModel');
const ClassificationService = require('./classificationService');
const logger = require('../config/logger');

/**
 * Task Service - Business logic layer
 */
class TaskService {
  /**
   * Create a new task with auto-classification
   */
  static async createTask(taskData) {
    try {
      // Perform classification
      const classification = ClassificationService.classifyTask(taskData);

      // Merge classification results with task data
      const taskToCreate = {
        ...taskData,
        ...classification,
        status: taskData.status || 'pending'
      };

      // Create task in database
      const task = await TaskModel.create(taskToCreate);

      logger.info('Task service: Task created successfully', {
        taskId: task.id,
        category: task.category,
        priority: task.priority
      });

      return task;
    } catch (error) {
      logger.error('Task service: Error creating task', { 
        error: error.message,
        stack: error.stack 
      });
      throw error;
    }
  }

  /**
   * Get all tasks with filters
   */
  static async getAllTasks(filters) {
    try {
      const result = await TaskModel.findAll(filters);

      logger.info('Task service: Tasks retrieved', {
        count: result.tasks.length,
        total: result.pagination.total
      });

      return result;
    } catch (error) {
      logger.error('Task service: Error retrieving tasks', { 
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get task by ID with history
   */
  static async getTaskById(id) {
    try {
      const task = await TaskModel.findById(id);

      if (!task) {
        return null;
      }

      // Get task history
      const history = await TaskModel.getHistory(id);

      logger.info('Task service: Task retrieved by ID', { taskId: id });

      return {
        task,
        history
      };
    } catch (error) {
      logger.error('Task service: Error retrieving task by ID', { 
        taskId: id,
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Update task
   */
  static async updateTask(id, updates) {
    try {
      // Get existing task
      const oldTask = await TaskModel.findById(id);

      if (!oldTask) {
        return null;
      }

      // Re-classify if needed
      const classification = ClassificationService.reclassifyTask(oldTask, updates);

      // Merge updates with classification
      const updatesToApply = {
        ...updates,
        category: updates.category || classification.category,
        priority: updates.priority || classification.priority
      };

      // If title or description changed, update entities and actions
      if (updates.title || updates.description !== undefined) {
        updatesToApply.extracted_entities = classification.extracted_entities;
        updatesToApply.suggested_actions = classification.suggested_actions;
      }

      // Update task in database
      const updatedTask = await TaskModel.update(id, updatesToApply);

      // Create history entry for the update
      const changedFields = Object.keys(updates).reduce((acc, key) => {
        if (oldTask[key] !== updatedTask[key]) {
          acc[key] = { old: oldTask[key], new: updatedTask[key] };
        }
        return acc;
      }, {});

      if (Object.keys(changedFields).length > 0) {
        const action = updates.status && updates.status !== oldTask.status 
          ? 'status_changed' 
          : 'updated';

        await TaskModel.createHistory(
          id,
          action,
          { ...oldTask },
          { ...updatedTask },
          'user'
        );
      }

      logger.info('Task service: Task updated successfully', {
        taskId: id,
        updatedFields: Object.keys(updates)
      });

      return updatedTask;
    } catch (error) {
      logger.error('Task service: Error updating task', { 
        taskId: id,
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Delete task
   */
  static async deleteTask(id) {
    try {
      const task = await TaskModel.findById(id);

      if (!task) {
        return null;
      }

      await TaskModel.delete(id);

      logger.info('Task service: Task deleted successfully', { taskId: id });

      return { success: true, deletedTask: task };
    } catch (error) {
      logger.error('Task service: Error deleting task', { 
        taskId: id,
        error: error.message 
      });
      throw error;
    }
  }

  /**
   * Get task statistics
   */
  static async getStatistics() {
    try {
      const stats = {
        byStatus: {},
        byCategory: {},
        byPriority: {},
        total: 0
      };

      // This could be optimized with aggregate queries
      // For now, we'll keep it simple
      const allTasks = await TaskModel.findAll({ limit: 10000 });
      
      stats.total = allTasks.pagination.total;

      allTasks.tasks.forEach(task => {
        // Count by status
        stats.byStatus[task.status] = (stats.byStatus[task.status] || 0) + 1;
        
        // Count by category
        stats.byCategory[task.category] = (stats.byCategory[task.category] || 0) + 1;
        
        // Count by priority
        stats.byPriority[task.priority] = (stats.byPriority[task.priority] || 0) + 1;
      });

      return stats;
    } catch (error) {
      logger.error('Task service: Error getting statistics', { 
        error: error.message 
      });
      throw error;
    }
  }
}

module.exports = TaskService;