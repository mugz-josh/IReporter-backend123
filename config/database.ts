import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

console.log("🔍 DATABASE_URL in environment:", process.env.DATABASE_URL ? "SET" : "NOT SET");
console.log("🔍 DATABASE_URL value (first 20 chars):", process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + "..." : "undefined");

// For Supabase, use the connection string
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // SSL configuration for Vercel deployment
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});


const testConnection = async () => {
  try {
    console.log("🔍 Attempting database connection...");
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL database via connection pool");
    client.release();
  } catch (err) {
    console.error("❌ Error connecting to PostgreSQL database:", err);
    console.error("❌ Error details:", {
      message: err.message,
      code: err.code,
      errno: err.errno,
      syscall: err.syscall,
      address: err.address,
      port: err.port
    });
  }
};

testConnection();

export default pool;
