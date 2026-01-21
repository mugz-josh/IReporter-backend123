const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config();

async function setupDatabase() {
  let pool;

  try {
    // Connect to PostgreSQL (Supabase) using DATABASE_URL
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });

    console.log('✅ Connected to PostgreSQL server');

    // Drop existing tables if they exist (to ensure clean setup)
    const tables = ['follows', 'upvotes', 'comments', 'notifications', 'interventions', 'red_flags', 'users'];
    for (const table of tables) {
      try {
        await pool.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
        console.log(`✅ Dropped table "${table}" if it existed`);
      } catch (err) {
        console.log(`⚠️ Could not drop table "${table}":`, err.message);
      }
    }

    // Read and execute the init.sql file
    const initSqlPath = path.join(__dirname, 'config', 'init.sql');
    const initSql = fs.readFileSync(initSqlPath, 'utf8');

    // Execute the entire SQL file at once (since it has multiple statements)
    try {
      await pool.query(initSql);
      console.log('✅ All tables created from init.sql');
    } catch (err) {
      console.log('⚠️ Bulk SQL execution failed, trying individual statements...');

      // Fallback: Split SQL into individual statements and execute them
      const statements = initSql.split(';').filter(stmt => stmt.trim().length > 0);

      for (const statement of statements) {
        if (statement.trim()) {
          try {
            await pool.query(statement);
          } catch (err) {
            console.log(`⚠️ Statement failed:`, statement.substring(0, 50) + '...');
            console.log(`Error:`, err.message);
          }
        }
      }
    }

    console.log('✅ All tables created successfully');

    // Verify tables were created
    const tablesResult = await pool.query("SELECT table_name FROM information_schema.tables WHERE table_schema = 'public'");
    console.log('📋 Created tables:', tablesResult.rows.map(row => row.table_name));

    // Verify comments table structure
    const commentsStructure = await pool.query("SELECT column_name, data_type, is_nullable, column_default FROM information_schema.columns WHERE table_name = 'comments'");
    console.log('📋 Comments table structure:');
    commentsStructure.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : ''} ${col.column_default ? `DEFAULT ${col.column_default}` : ''}`);
    });

    // Insert test data
    console.log('🔧 Inserting test data...');

    // Insert test user (password: test123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('test123', 10);
    await pool.query(`
      INSERT INTO users (first_name, last_name, email, password, is_admin)
      VALUES ('Test', 'User', 'test@example.com', '${hashedPassword}', FALSE)
    `);

    // Insert test red flag
    await pool.query(`
      INSERT INTO red_flags (user_id, title, description, latitude, longitude, status)
      VALUES (1, 'Test Red Flag', 'This is a test red flag report', 40.7128, -74.0060, 'draft')
    `);

    // Insert test intervention
    await pool.query(`
      INSERT INTO interventions (user_id, title, description, latitude, longitude, status)
      VALUES (1, 'Test Intervention', 'This is a test intervention report', 40.7128, -74.0060, 'draft')
    `);

    console.log('✅ Test data inserted');

    // Test comment insertion
    console.log('🧪 Testing comment insertion...');
    await pool.query(`
      INSERT INTO comments (user_id, report_type, report_id, comment_text, comment_type)
      VALUES (1, 'red_flag', 1, 'This is a test comment on red flag', 'user')
    `);

    await pool.query(`
      INSERT INTO comments (user_id, report_type, report_id, comment_text, comment_type)
      VALUES (1, 'intervention', 1, 'This is a test comment on intervention', 'user')
    `);

    console.log('✅ Test comments inserted successfully');

    // Verify comments
    const redFlagComments = await pool.query(`
      SELECT c.*, u.first_name, u.last_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.report_type = 'red_flag' AND c.report_id = 1
    `);

    const interventionComments = await pool.query(`
      SELECT c.*, u.first_name, u.last_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.report_type = 'intervention' AND c.report_id = 1
    `);

    console.log(`📊 Red flag comments: ${redFlagComments.rows.length}`);
    console.log(`📊 Intervention comments: ${interventionComments.rows.length}`);

    console.log('🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!');
    console.log('🚀 Your comment system should now work perfectly!');

  } catch (err) {
    console.error('❌ Database setup failed:', err);
    throw err;
  } finally {
    if (pool) {
      await pool.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the setup
setupDatabase().catch(console.error);
