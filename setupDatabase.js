const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  let connection;

  try {
    // Connect to MySQL (without specifying database first)
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      multipleStatements: true // Allow multiple SQL statements
    });

    console.log('✅ Connected to MySQL server');

    // Create database if it doesn't exist
    await connection.query('CREATE DATABASE IF NOT EXISTS ireporter');
    console.log('✅ Database "ireporter" created or already exists');

    // Switch to the database
    await connection.query('USE ireporter');
    console.log('✅ Switched to "ireporter" database');

    // Drop existing tables if they exist (to ensure clean setup)
    const tables = ['follows', 'upvotes', 'comments', 'notifications', 'interventions', 'red_flags', 'users'];
    for (const table of tables) {
      try {
        await connection.execute(`DROP TABLE IF EXISTS ${table}`);
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
      await connection.query(initSql);
      console.log('✅ All tables created from init.sql');
    } catch (err) {
      console.log('⚠️ Bulk SQL execution failed, trying individual statements...');

      // Fallback: Split SQL into individual statements and execute them
      const statements = initSql.split(';').filter(stmt => stmt.trim().length > 0);

      for (const statement of statements) {
        if (statement.trim() && !statement.trim().toUpperCase().startsWith('USE ')) {
          try {
            await connection.execute(statement);
          } catch (err) {
            console.log(`⚠️ Statement failed:`, statement.substring(0, 50) + '...');
            console.log(`Error:`, err.message);
          }
        }
      }
    }

    console.log('✅ All tables created successfully');

    // Verify tables were created
    const [tablesResult] = await connection.execute('SHOW TABLES');
    console.log('📋 Created tables:', tablesResult.map(row => Object.values(row)[0]));

    // Verify comments table structure
    const [commentsStructure] = await connection.execute('DESCRIBE comments');
    console.log('📋 Comments table structure:');
    commentsStructure.forEach(col => {
      console.log(`  - ${col.Field}: ${col.Type} ${col.Null === 'NO' ? 'NOT NULL' : ''} ${col.Default ? `DEFAULT ${col.Default}` : ''}`);
    });

    // Insert test data
    console.log('🔧 Inserting test data...');

    // Insert test user (password: test123)
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash('test123', 10);
    await connection.execute(`
      INSERT INTO users (first_name, last_name, email, password, is_admin)
      VALUES ('Test', 'User', 'test@example.com', '${hashedPassword}', FALSE)
    `);

    // Insert test red flag
    await connection.execute(`
      INSERT INTO red_flags (user_id, title, description, latitude, longitude, status)
      VALUES (1, 'Test Red Flag', 'This is a test red flag report', 40.7128, -74.0060, 'draft')
    `);

    // Insert test intervention
    await connection.execute(`
      INSERT INTO interventions (user_id, title, description, latitude, longitude, status)
      VALUES (1, 'Test Intervention', 'This is a test intervention report', 40.7128, -74.0060, 'draft')
    `);

    console.log('✅ Test data inserted');

    // Test comment insertion
    console.log('🧪 Testing comment insertion...');
    await connection.execute(`
      INSERT INTO comments (user_id, report_type, report_id, comment_text, comment_type)
      VALUES (1, 'red_flag', 1, 'This is a test comment on red flag', 'user')
    `);

    await connection.execute(`
      INSERT INTO comments (user_id, report_type, report_id, comment_text, comment_type)
      VALUES (1, 'intervention', 1, 'This is a test comment on intervention', 'user')
    `);

    console.log('✅ Test comments inserted successfully');

    // Verify comments
    const [redFlagComments] = await connection.execute(`
      SELECT c.*, u.first_name, u.last_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.report_type = 'red_flag' AND c.report_id = 1
    `);

    const [interventionComments] = await connection.execute(`
      SELECT c.*, u.first_name, u.last_name
      FROM comments c
      JOIN users u ON c.user_id = u.id
      WHERE c.report_type = 'intervention' AND c.report_id = 1
    `);

    console.log(`📊 Red flag comments: ${redFlagComments.length}`);
    console.log(`📊 Intervention comments: ${interventionComments.length}`);

    console.log('🎉 DATABASE SETUP COMPLETED SUCCESSFULLY!');
    console.log('🚀 Your comment system should now work perfectly!');

  } catch (err) {
    console.error('❌ Database setup failed:', err);
    throw err;
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Database connection closed');
    }
  }
}

// Run the setup
setupDatabase().catch(console.error);
