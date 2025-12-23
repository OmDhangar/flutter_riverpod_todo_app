const { query, transaction } = require('../config/database');
const logger = require('../config/logger');

/**
 * Task Model - Database operations for tasks
 */
class TaskModel {
  /**
   * Create a new task
   */
  static async create(taskData) {
    const {
      title,
      description,
      category,
      priority,
      status = 'pending',
      assigned_to,
      due_date,
      extracted_entities,
      suggested_actions
    } = taskData;

    const insertQuery = `
      INSERT INTO tasks (
        title, description, category, priority, status,
        assigned_to, due_date, extracted_entities, suggested_actions
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      title,
      description,
      category,
      priority,
      status,
      assigned_to,
      due_date,
      JSON.stringify(extracted_entities || {}),
      JSON.stringify(suggested_actions || [])
    ];

    try {
      const result = await query(insertQuery, values);
      const task = result.rows[0];

      // Create history entry
      await this.createHistory(task.id, 'created', null, {
        title: task.title,
        category: task.category,
        priority: task.priority,
        status: task.status
      });

      logger.info('Task created', { taskId: task.id, title: task.title });
      return task;
    } catch (error) {
      logger.error('Error creating task', { error: error.message });
      throw error;
    }
  }

  /**
   * Find all tasks with filters and pagination
   */
  static async findAll(filters = {}) {
    const {
      status,
      category,
      priority,
      search,
      sortBy = 'created_at',
      sortOrder = 'desc',
      limit = 10,
      offset = 0
    } = filters;

    let queryText = 'SELECT * FROM tasks WHERE 1=1';
    const values = [];
    let paramIndex = 1;

    // Apply filters
    if (status) {
      queryText += ` AND status = $${paramIndex}`;
      values.push(status);
      paramIndex++;
    }

    if (category) {
      queryText += ` AND category = $${paramIndex}`;
      values.push(category);
      paramIndex++;
    }

    if (priority) {
      queryText += ` AND priority = $${paramIndex}`;
      values.push(priority);
      paramIndex++;
    }

    if (search) {
      queryText += ` AND (title ILIKE $${paramIndex} OR description ILIKE $${paramIndex})`;
      values.push(`%${search}%`);
      paramIndex++;
    }

    // Get total count before pagination
    const countQuery = queryText.replace('SELECT *', 'SELECT COUNT(*) as total');
    const countResult = await query(countQuery, values);
    const total = parseInt(countResult.rows[0].total);

    // Add sorting and pagination
    const validSortColumns = ['created_at', 'updated_at', 'due_date', 'priority', 'title'];
    const sortColumn = validSortColumns.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';

    queryText += ` ORDER BY ${sortColumn} ${order}, id DESC`;
    queryText += ` LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    values.push(limit, offset);

    try {
      const result = await query(queryText, values);
      
      logger.info('Tasks retrieved', { 
        count: result.rows.length, 
        filters 
      });

      return {
        tasks: result.rows,
        pagination: {
          total,
          limit,
          offset,
          totalPages: Math.ceil(total / limit),
          currentPage: Math.floor(offset / limit) + 1,
          hasNext: offset + limit < total,
          hasPrevious: offset > 0
        }
      };
    } catch (error) {
      logger.error('Error retrieving tasks', { error: error.message });
      throw error;
    }
  }

  /**
   * Find task by ID
   */
  static async findById(id) {
    const queryText = 'SELECT * FROM tasks WHERE id = $1';
    
    try {
      const result = await query(queryText, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      return result.rows[0];
    } catch (error) {
      logger.error('Error finding task by ID', { taskId: id, error: error.message });
      throw error;
    }
  }

  /**
   * Update task
   */
  static async update(id, updates) {
    // Build dynamic update query
    const fields = [];
    const values = [];
    let paramIndex = 1;

    Object.keys(updates).forEach(key => {
      if (updates[key] !== undefined) {
        fields.push(`${key} = $${paramIndex}`);
        
        // Handle JSONB fields
        if (key === 'extracted_entities' || key === 'suggested_actions') {
          values.push(JSON.stringify(updates[key]));
        } else {
          values.push(updates[key]);
        }
        paramIndex++;
      }
    });

    if (fields.length === 0) {
      throw new Error('No fields to update');
    }

    // Always update updated_at
    fields.push(`updated_at = NOW()`);

    const queryText = `
      UPDATE tasks
      SET ${fields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;
    values.push(id);

    try {
      const result = await query(queryText, values);
      
      if (result.rows.length === 0) {
        return null;
      }

      const updatedTask = result.rows[0];
      logger.info('Task updated', { taskId: id, updates: Object.keys(updates) });
      
      return updatedTask;
    } catch (error) {
      logger.error('Error updating task', { taskId: id, error: error.message });
      throw error;
    }
  }

  /**
   * Delete task
   */
  static async delete(id) {
    const queryText = 'DELETE FROM tasks WHERE id = $1 RETURNING *';
    
    try {
      const result = await query(queryText, [id]);
      
      if (result.rows.length === 0) {
        return null;
      }

      const deletedTask = result.rows[0];

      // Create history entry
      await this.createHistory(id, 'deleted', {
        title: deletedTask.title,
        status: deletedTask.status
      }, null);

      logger.info('Task deleted', { taskId: id });
      return deletedTask;
    } catch (error) {
      logger.error('Error deleting task', { taskId: id, error: error.message });
      throw error;
    }
  }

  /**
   * Get task history
   */
  static async getHistory(taskId) {
    const queryText = `
      SELECT * FROM task_history
      WHERE task_id = $1
      ORDER BY changed_at DESC
    `;

    try {
      const result = await query(queryText, [taskId]);
      return result.rows;
    } catch (error) {
      logger.error('Error retrieving task history', { taskId, error: error.message });
      throw error;
    }
  }

  /**
   * Create history entry
   */
  static async createHistory(taskId, action, oldValue, newValue, changedBy = 'system') {
    const queryText = `
      INSERT INTO task_history (task_id, action, old_value, new_value, changed_by)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;

    const values = [
      taskId,
      action,
      oldValue ? JSON.stringify(oldValue) : null,
      newValue ? JSON.stringify(newValue) : null,
      changedBy
    ];

    try {
      const result = await query(queryText, values);
      return result.rows[0];
    } catch (error) {
      logger.error('Error creating history entry', { 
        taskId, 
        action, 
        error: error.message 
      });
      // Don't throw - history failure shouldn't break main operation
      return null;
    }
  }
}

module.exports = TaskModel;