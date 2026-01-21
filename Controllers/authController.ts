import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/database";
import {
  AuthRequest,
  SignupData,
  LoginData,
  AuthResponse,
  User,
} from "../types";
import {
  sendError,
  sendSuccess,
  validateUserAuth,
} from "../utils/controllerHelpers";
function formatUser(userData: any): Omit<User, "password"> {
  return {
    id: userData.id,
    first_name: userData.first_name,
    last_name: userData.last_name,
    email: userData.email,
    phone: userData.phone || undefined,
    is_admin: userData.is_admin,
    profile_picture: userData.profile_picture || undefined,
    created_at: userData.created_at,
    updated_at: userData.updated_at,
  };
}
function generateToken(payload: object): string {
  // HARDCODED JWT SECRET - THIS IS THE REAL SECRET KEY
  const JWT_SECRET = "iReporterSecureJWTKey2024!@#$%^&*()_+-=[]{}|;:,.<>?~`RandomStringForProduction";
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}
export const authController = {
  signup: async (req: Request, res: Response): Promise<void> => {
    try {
      console.log("🔍 Signup attempt - Request body:", req.body);
      console.log("🔍 Environment check - DATABASE_URL:", process.env.DATABASE_URL ? "SET" : "NOT SET");
      console.log("🔍 Environment check - JWT_SECRET:", process.env.JWT_SECRET ? "SET" : "NOT SET");

      const { first_name, last_name, email, password, phone }: SignupData =
        req.body;
      if (!first_name || !last_name || !email || !password) {
        console.log("❌ Validation failed - missing required fields");
        return sendError(
          res,
          400,
          "First name, last name, email, and password are required"
        );
      }

      console.log("🔍 Checking for existing user with email:", email);
      const existingUsers = await pool.query(
        "SELECT id FROM users WHERE email = $1",
        [email]
      );
      console.log("🔍 Existing users query result:", existingUsers.rows.length);

      if (existingUsers.rows.length > 0) {
        console.log("❌ User already exists with email:", email);
        return sendError(res, 400, "User already exists with this email");
      }

      console.log("🔍 Hashing password");
      const hashedPassword = await bcrypt.hash(password, 10);

      console.log("🔍 Inserting new user");
      const result = await pool.query(
        "INSERT INTO users (first_name, last_name, email, password, phone) VALUES ($1, $2, $3, $4, $5) RETURNING id",
        [first_name, last_name, email, hashedPassword, phone || null]
      );
      console.log("🔍 Insert result:", result.rows);

      const userId = result.rows[0].id;
      console.log("🔍 Retrieving created user with ID:", userId);
      const userResults = await pool.query(
        "SELECT id, first_name, last_name, email, phone, is_admin, created_at, updated_at FROM users WHERE id = $1",
        [userId]
      );
      console.log("🔍 User retrieval result:", userResults.rows.length);

      if (userResults.rows.length === 0) {
        console.log("❌ Failed to retrieve user after creation");
        return sendError(res, 500, "Failed to retrieve user after creation");
      }

      const user = formatUser(userResults.rows[0]);
      console.log("🔍 Generating token for user:", user.email);

      const token = generateToken({ id: user.id, email: user.email });

      const authResponse: AuthResponse = { token, user };
      console.log("✅ Signup successful for user:", user.email);
      sendSuccess(res, 201, authResponse);
    } catch (error: any) {
      console.error("❌ Signup error:", error);
      console.error("❌ Error stack:", error.stack);
      console.error("❌ Error message:", error.message);
      sendError(res, 500, "Server error during signup", error);
    }
  },
  login: async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password }: LoginData = req.body;
      console.log("Login attempt for email:", email);
      console.log("Password provided (first 10 chars):", password ? password.substring(0, 10) + "..." : "undefined");

      if (!email || !password) {
        console.log("Missing email or password");
        return sendError(res, 400, "Email and password are required");
      }

      const results = await pool.query(
        "SELECT * FROM users WHERE email = $1",
        [email]
      );
      console.log("Query results length:", results.rows.length);

      if (results.rows.length === 0) {
        console.log("User not found for email:", email);
        return sendError(res, 400, "Invalid email or password");
      }

      const userData = results.rows[0];
      console.log("User found:", userData.email, "Password hash:", userData.password.substring(0, 20) + "...");
      const isPasswordValid = await bcrypt.compare(password, userData.password);
      console.log("Password valid:", isPasswordValid);

      if (!isPasswordValid) {
        console.log("Invalid password for user:", email);
        return sendError(res, 400, "Invalid email or password");
      }

      const user = formatUser(userData);

      const token = generateToken({
        id: user.id,
        email: user.email,
        isAdmin: user.is_admin,
      });

      const authResponse: AuthResponse = { token, user };
      sendSuccess(res, 200, authResponse);
    } catch (error) {
      sendError(res, 500, "Server error during login", error);
    }
  },
  getProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const authCheck = validateUserAuth(userId);
      if (!authCheck.valid) {
        return sendError(
          res,
          401,
          authCheck.error || "Authentication required"
        );
      }

      const results = await pool.query(
        "SELECT id, first_name, last_name, email, phone, is_admin, profile_picture, created_at, updated_at FROM users WHERE id = $1",
        [userId]
      );

      if (results.rows.length === 0) {
        return sendError(res, 404, "User not found");
      }

      const user = formatUser(results.rows[0]);
      sendSuccess(res, 200, user);
    } catch (error) {
      sendError(res, 500, "Server error while fetching profile", error);
    }
  },
  updateProfile: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const {
        first_name,
        last_name,
        email,
        phone,
      }: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
      } = req.body;

      const authCheck = validateUserAuth(userId);
      if (!authCheck.valid) {
        return sendError(
          res,
          401,
          authCheck.error || "Authentication required"
        );
      }

      
      if (!first_name && !last_name && !email && phone === undefined) {
        return sendError(
          res,
          400,
          "At least one field must be provided for update"
        );
      }
      if (email) {
        const existingUsers = await pool.query(
          "SELECT id FROM users WHERE email = $1 AND id != $2",
          [email, userId]
        );
        if (existingUsers.rows.length > 0) {
          return sendError(res, 400, "Email is already in use by another user");
        }
      }

      const updates: string[] = [];
      const values: any[] = [];

      if (first_name) {
        updates.push("first_name = $1");
        values.push(first_name);
      }
      if (last_name) {
        updates.push("last_name = $2");
        values.push(last_name);
      }
      if (email) {
        updates.push("email = $3");
        values.push(email);
      }
      if (phone !== undefined) {
        updates.push("phone = $4");
        values.push(phone || null);
      }

      updates.push("updated_at = NOW()");
      values.push(userId);

      const query = `UPDATE users SET ${updates.join(", ")} WHERE id = $${values.length}`;

      await pool.query(query, values);

      
      const results = await pool.query(
        "SELECT id, first_name, last_name, email, phone, is_admin, profile_picture, created_at, updated_at FROM users WHERE id = $1",
        [userId]
      );

      if (results.rows.length === 0) {
        return sendError(res, 404, "User not found after update");
      }

    const user = formatUser(results.rows[0]);
      sendSuccess(res, 200, user);
    } catch (error) {
      sendError(res, 500, "Server error while updating profile", error);
    }
  },

  uploadProfilePicture: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return sendError(res, 401, "Authentication required");
      }

      if (!req.file) {
        return sendError(res, 400, "No file uploaded");
      }

      const filePath = `/uploads/${req.file.filename}`;

      await pool.query(
        "UPDATE users SET profile_picture = $1, updated_at = NOW() WHERE id = $2",
        [filePath, userId]
      );

      sendSuccess(res, 200, [{ profile_picture: filePath }]);
    } catch (error) {
      sendError(res, 500, "Server error while uploading profile picture", error);
    }
  },

  getUsers: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;

    const authCheck = validateUserAuth(userId);
      if (!authCheck.valid) {
        return sendError(
          res,
          401,
          authCheck.error || "Authentication required"
        );
      }

    const userResults = await pool.query(
        "SELECT is_admin FROM users WHERE id = $1",
        [userId]
      );

      if (userResults.rows.length === 0 || !userResults.rows[0].is_admin) {
        return sendError(res, 403, "Admin access required");
      }

    const results = await pool.query(
        "SELECT id, first_name, last_name, email, phone, is_admin, profile_picture, created_at, updated_at FROM users ORDER BY created_at DESC"
      );

   const users = results.rows.map(formatUser);
      sendSuccess(res, 200, users);
    } catch (error) {
      sendError(res, 500, "Server error while fetching users", error);
    }
  },
};

export default authController;
