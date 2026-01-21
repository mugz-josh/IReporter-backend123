import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// HARDCODED SUPABASE DATABASE URL - THIS IS THE REAL CONNECTION STRING
const SUPABASE_URL = "postgresql://postgres:s3%23as5Q8YRXb7BW@db.vkcfeqxovzphtquracho.supabase.co:5432/postgres";

console.log("🔍 DATABASE_URL in environment:", process.env.DATABASE_URL ? "SET" : "NOT SET");
console.log("🔍 Using database URL:", SUPABASE_URL.substring(0, 30) + "...");

// For Supabase, use the connection string
const pool = new pg.Pool({
  connectionString: SUPABASE_URL,
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
