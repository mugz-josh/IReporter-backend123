// src/createTables.ts

// 1. Load dotenv FIRST to ensure process.env is populated
import * as dotenv from "dotenv";
dotenv.config();

// 2. Import the pool AFTER the environment variables are loaded
import pool from "../config/database";

async function createTables() {
  try {
    // Create interventions table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS interventions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        status ENUM('draft','under-investigation','rejected','resolved') DEFAULT 'draft',
        images LONGTEXT,
        videos LONGTEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Interventions table created successfully!");

    // Create red_flags table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS red_flags (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        latitude DECIMAL(10,8) NOT NULL,
        longitude DECIMAL(11,8) NOT NULL,
        status ENUM('draft','under-investigation','rejected','resolved') DEFAULT 'draft',
        images LONGTEXT,
        videos LONGTEXT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Red_flags table created successfully!");

    // Create notifications table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS notifications (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        is_read TINYINT(1) DEFAULT 0,
        related_entity_type VARCHAR(50),
        related_entity_id INT,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Notifications table created successfully!");

    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        phone VARCHAR(20),
        is_admin TINYINT(1) DEFAULT 0,
        profile_picture VARCHAR(255),
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `);
    console.log("✅ Users table created successfully!");
  } catch (err) {
    console.error("❌ Error creating tables:", err);
  } finally {
    // Ensure the pool connection is closed
    pool.end();
  }
}

// Run the function
createTables();
