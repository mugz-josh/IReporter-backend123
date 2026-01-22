import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// HARDCODED SUPABASE DATABASE URL FOR PRODUCTION
const DATABASE_URL = "postgresql://postgres:s3%23as5Q8YRXb7BW@db.vkcfeqxovzphtquracho.supabase.co:5432/postgres";

console.log("🔍 USING HARDCODED DATABASE URL:", DATABASE_URL.substring(0, 30) + "...");

// USE HARDCODED DATABASE URL
const pool = new pg.Pool({
  connectionString: DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // SSL configuration for Vercel deployment
  ssl: { rejectUnauthorized: false }
});


const testConnection = async () => {
  try {
    console.log("🔍 Attempting database connection...");
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL database via connection pool");
    client.release();
  } catch (err: any) {
    console.error("❌ Error connecting to PostgreSQL database:", err.message);
    console.error("❌ Error code:", err.code);
    // Removed detailed error logging to reduce noise
  }
};

// Only run connection test in development, not in serverless environment
if (process.env.NODE_ENV !== 'production') {
  testConnection();
}

export default pool;
