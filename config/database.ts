import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

// For Supabase, use the connection string
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});


const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Connected to PostgreSQL database via connection pool");
    client.release();
  } catch (err) {
    console.error("❌ Error connecting to PostgreSQL database:", err);
  }
};

testConnection();

export default pool;
