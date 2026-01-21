import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const pool = new pg.Pool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ireporter',
  port: parseInt(process.env.DB_PORT || '5432'),
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});


const testConnection = async () => {
  try {
    const connection = await pool.getConnection();
    console.log("✅ Connected to MySQL database via connection pool");
    connection.release();
  } catch (err) {
    console.error("❌ Error connecting to MySQL database:", err);
  }
};

testConnection();

export default pool;
