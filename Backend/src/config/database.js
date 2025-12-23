const { Pool } = require('pg');
const { createClient } = require('@supabase/supabase-js');
const logger = require('./logger');

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 10000,
});

// Supabase client (optional - for real-time features)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

// Connection event handlers
pool.on('connect', () => {
  logger.info('✅ Database connected successfully');
});

pool.on('error', (err) => {
  logger.error('❌ Unexpected database error', { error: err.message });
  process.exit(-1);
});

// Query wrapper with logging and error handling
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug('Executed query', { 
      text: text.substring(0, 100), 
      duration, 
      rows: result.rowCount 
    });
    return result;
  } catch (error) {
    logger.error('Database query error', { 
      text: text.substring(0, 100), 
      error: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// Transaction helper
const transaction = async (callback) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Test database connection
const testConnection = async () => {
  try {
    const result = await query('SELECT NOW()');
    logger.info('Database connection test successful', { 
      timestamp: result.rows[0].now 
    });
    return true;
  } catch (error) {
    logger.error('Database connection test failed', { error: error.message });
    return false;
  }
};

module.exports = {
  pool,
  query,
  transaction,
  supabase,
  testConnection
};