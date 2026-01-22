import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import routes from "../routes/routes";
import notificationController from "../Controllers/notificationController";
import pool from "../config/database";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ---------------------------
// CORS CONFIGURATION (PRODUCTION SAFE)
// ---------------------------
app.use(
  cors({
    origin: (origin, callback) => {
      // List of allowed origins
      const allowedOrigins = [
        "http://localhost:3001", // for local dev
        "https://i-reporter-frontend123.vercel.app", // frontend live
      ];

      // Allow requests with no origin (Postman, curl)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS policy: This origin is not allowed"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Handle preflight OPTIONS requests
app.options("*", cors());

// ---------------------------
// MIDDLEWARE
// ---------------------------
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// ---------------------------
// ROUTES
// ---------------------------
app.use("/api/v1", routes);

// Health check endpoint
app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    data: [{ message: "iReporter API is running successfully" }],
  });
});

// HARDCODED SUPABASE DATABASE URL - FORCED CONNECTION
const HARDCODED_DATABASE_URL = "postgresql://postgres:s3%23as5Q8YRXb7BW@db.vkcfeqxovzphtquracho.supabase.co:5432/postgres";

// Database connection test endpoint
app.get("/test-db", async (req: Request, res: Response) => {
  try {
    const client = await pool.connect();
    console.log("✅ Database connection successful");
    client.release();

    res.status(200).json({
      status: 200,
      message: "Database connection successful",
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT SET",
        JWT_SECRET: process.env.JWT_SECRET ? "SET" : "NOT SET",
        NODE_ENV: process.env.NODE_ENV,
      }
    });
  } catch (error: any) {
    console.error("❌ Database connection failed:", error);
    res.status(500).json({
      status: 500,
      error: "Database connection failed",
      details: error.message,
      env: {
        DATABASE_URL: process.env.DATABASE_URL ? "SET" : "NOT SET",
        JWT_SECRET: process.env.JWT_SECRET ? "SET" : "NOT SET",
        NODE_ENV: process.env.NODE_ENV,
      }
    });
  }
});

// Optional: test Supabase connection (proof your DB works)
// Note: This endpoint requires a supabase client setup
// app.get("/test-supabase", async (req: Request, res: Response) => {
//   try {
//     const { supabase } = await import("./lib/supabase"); // your supabase client
//     const { data, error } = await supabase.from("users").select("*");
//     if (error) throw error;
//     res.status(200).json({ data });
//   } catch (err: any) {
//     res.status(500).json({ error: err.message });
//   }
// });

// ---------------------------
// ERROR HANDLING
// ---------------------------
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 500,
    error: err.message || "Something went wrong!",
  });
});

// ---------------------------
// START SERVER
// ---------------------------
app.listen(PORT, () => {
  console.log(`iReporter server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
