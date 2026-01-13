require('dotenv').config();
const mysql = require('mysql2/promise');

async function setupDatabase() {
  let connection;

  try {
    // Create connection
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'ireporter'
    });

    console.log('Connected to database');

    // Create comments table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        report_type ENUM('red_flag', 'intervention') NOT NULL,
        report_id INT NOT NULL,
        comment_text TEXT NOT NULL,
        comment_type ENUM('user', 'admin', 'official') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    console.log('✅ Comments table created/verified');

    // Create upvotes table if it doesn't exist
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS upvotes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        report_type ENUM('red_flag', 'intervention') NOT NULL,
        report_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_upvote (user_id, report_type, report_id)
      )
    `);
    console.log('✅ Upvotes table created/verified');

    // Check if tables exist
    const [tables] = await connection.execute('SHOW TABLES');
    console.log('Available tables:', tables.map(row => Object.values(row)[0]));

  } catch (err) {
    console.error('Database setup error:', err);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

setupDatabase();
