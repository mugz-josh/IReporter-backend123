const pg = require("pg");
const dotenv = require("dotenv");

dotenv.config();

// FORCED HARDCODED SUPABASE DATABASE URL - NO ENVIRONMENT VARIABLES NEEDED
const FORCED_DATABASE_URL = "postgresql://postgres:s3%23as5Q8YRXb7BW@db.vkcfeqxovzphtquracho.supabase.co:5432/postgres";

console.log("🔍 DATABASE_URL in environment:", process.env.DATABASE_URL ? "SET" : "NOT SET");
console.log("🔍 FORCED HARDCODED DATABASE URL:", FORCED_DATABASE_URL.substring(0, 30) + "...");

// FORCE USING HARDCODED CONNECTION - IGNORE ENVIRONMENT VARIABLES
const pool = new pg.Pool({
  connectionString: FORCED_DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  // SSL configuration for Vercel deployment
  ssl: { rejectUnauthorized: false },
  // Force IPv6 to match nslookup result
  family: 6
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

module.exports = pool;
