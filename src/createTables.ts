// src/createTables.ts

// 1. Load dotenv FIRST to ensure process.env is populated
import * as dotenv from "dotenv";
dotenv.config();

// 2. Import the pool AFTER the environment variables are loaded
import pool from "../config/database";

async function createTables() {
  try {
    // Create status enum type for PostgreSQL
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE report_status AS ENUM ('draft', 'under-investigation', 'rejected', 'resolved');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log("✅ Report status enum created/verified");

    // Create comment_type enum
    await pool.query(`
      DO $$ BEGIN
        CREATE TYPE comment_type_enum AS ENUM ('user', 'admin', 'official');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);
    console.log("✅ Comment type enum created/verified");

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        is_admin BOOLEAN DEFAULT FALSE,
        profile_picture VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Users table created successfully!");

    // Create interventions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS interventions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        status report_status DEFAULT 'draft',
        images TEXT,
        videos TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Interventions table created successfully!");

    // Create red_flags table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS red_flags (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        status report_status DEFAULT 'draft',
        images TEXT,
        videos TEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Red_flags table created successfully!");

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read BOOLEAN DEFAULT FALSE,
        related_entity_type VARCHAR(50),
        related_entity_id INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Notifications table created successfully!");

    // Create comments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('red_flag', 'intervention')),
        report_id INTEGER NOT NULL,
        comment_text TEXT NOT NULL,
        comment_type comment_type_enum DEFAULT 'user',
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Comments table created successfully!");

    // Create upvotes table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS upvotes (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('red_flag', 'intervention')),
        report_id INTEGER NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, report_type, report_id)
      );
    `);
    console.log("✅ Upvotes table created successfully!");

    // Create indexes for better performance
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_interventions_user_id ON interventions(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_red_flags_user_id ON red_flags(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_comments_report ON comments(report_type, report_id);`);
    await pool.query(`CREATE INDEX IF NOT EXISTS idx_upvotes_report ON upvotes(report_type, report_id);`);

    console.log("✅ All indexes created successfully!");

  } catch (err) {
    console.error("❌ Error creating tables:", err);
  } finally {
    // Ensure the pool connection is closed
    pool.end();
  }
}

// Run the function
createTables();
