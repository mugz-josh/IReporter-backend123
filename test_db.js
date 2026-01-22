require('dotenv').config();
const pool = require('./config/database');

async function testDatabase() {
  try {
    console.log('🔍 Testing database connection...');

    // Test connection
    const client = await pool.connect();
    console.log('✅ Database connection successful');

    // Check if users table exists
    const usersTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
      );
    `);
    console.log('Users table exists:', usersTable.rows[0].exists);

    // If users table exists, try a simple query
    if (usersTable.rows[0].exists) {
      const userCount = await client.query('SELECT COUNT(*) FROM users');
      console.log('Number of users:', userCount.rows[0].count);
    }

    // Check other tables
    const tables = ['interventions', 'red_flags', 'notifications', 'comments', 'upvotes'];
    for (const table of tables) {
      const result = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables
          WHERE table_schema = 'public'
          AND table_name = $1
        );
      `, [table]);
      console.log(`${table} table exists:`, result.rows[0].exists);
    }

    client.release();
    console.log('✅ Database test completed successfully');
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('❌ Error details:', error);
  } finally {
    pool.end();
  }
}

testDatabase();
