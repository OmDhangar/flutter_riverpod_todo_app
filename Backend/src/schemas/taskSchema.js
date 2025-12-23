const { z } = require('zod');

/* ===========================
   ENUMS
=========================== */
const categoryEnum = z.enum([
  'scheduling',
  'finance',
  'technical',
  'safety',
  'general'
]);

const priorityEnum = z.enum(['high', 'medium', 'low']);

const statusEnum = z.enum([
  'pending',
  'in_progress',
  'completed'
]);

/* ===========================
   SHARED HELPERS
=========================== */

/**
 * Accepts:
 * - ISO string
 * - Date
 * - null / undefined
 * Converts to ISO string or null
 */
const optionalDate = z
  .union([
    z.string().datetime(),
    z.date()
  ])
  .transform(val =>
    val instanceof Date ? val.toISOString() : val
  )
  .optional()
  .nullable();

/* ===========================
   CREATE TASK
=========================== */
const createTaskSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(500, 'Title must be less than 500 characters')
    .trim(),

  description: z
    .string()
    .max(5000, 'Description must be less than 5000 characters')
    .trim()
    .optional()
    .nullable(),

  assigned_to: z
    .string()
    .max(200, 'Assigned to must be less than 200 characters')
    .trim()
    .optional()
    .nullable(),

  due_date: optionalDate,

  category: categoryEnum.optional(),
  priority: priorityEnum.optional()
});

/* ===========================
   UPDATE TASK
=========================== */
const updateTaskSchema = z
  .object({
    title: z
      .string()
      .min(1, 'Title cannot be empty')
      .max(500, 'Title must be less than 500 characters')
      .trim()
      .optional(),

    description: z
      .string()
      .max(5000, 'Description must be less than 5000 characters')
      .trim()
      .optional()
      .nullable(),

    category: categoryEnum.optional(),

    priority: priorityEnum.optional(),

    status: statusEnum.optional(),

    assigned_to: z
      .string()
      .max(200, 'Assigned to must be less than 200 characters')
      .trim()
      .optional()
      .nullable(),

    due_date: optionalDate
  })
  .refine(
    data => Object.keys(data).length > 0,
    {
      message: 'At least one field must be provided for update'
    }
  );

/* ===========================
   LIST TASKS (QUERY PARAMS)
=========================== */
const listTasksQuerySchema = z.object({
  status: statusEnum.optional(),
  category: categoryEnum.optional(),
  priority: priorityEnum.optional(),

  search: z.string().max(200).optional(),

  sortBy: z
    .enum([
      'created_at',
      'updated_at',
      'due_date',
      'priority',
      'title'
    ])
    .default('created_at'),

  sortOrder: z.enum(['asc', 'desc']).default('desc'),

  limit: z
    .preprocess(
      val => (val === undefined ? 10 : Number(val)),
      z
        .number()
        .int()
        .min(1, 'Limit must be between 1 and 100')
        .max(100, 'Limit must be between 1 and 100')
    ),

  offset: z.preprocess(
    val => (val === undefined ? 0 : Number(val)),
    z
      .number()
      .int()
      .min(0, 'Offset must be non-negative')
  )
});

/* ===========================
   PARAMS
=========================== */
const uuidSchema = z
  .string()
  .uuid('Invalid task ID format');

/* ===========================
   EXPORTS
=========================== */
module.exports = {
  createTaskSchema,
  updateTaskSchema,
  listTasksQuerySchema,
  uuidSchema,
  categoryEnum,
  priorityEnum,
  statusEnum
};
