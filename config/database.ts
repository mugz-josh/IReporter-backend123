import mysql from "mysql2/promise"; 
import dotenv from "dotenv";

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ireporter',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
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
