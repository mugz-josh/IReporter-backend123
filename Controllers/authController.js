"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
const controllerHelpers_1 = require("../utils/controllerHelpers");
function formatUser(userData) {
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
function generateToken(payload) {
    const JWT_SECRET = process.env.JWT_SECRET || "fallback-secret-key-for-development";
    return jsonwebtoken_1.default.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}
exports.authController = {
    signup: async (req, res) => {
        try {
            const { first_name, last_name, email, password, phone } = req.body;
            if (!first_name || !last_name || !email || !password) {
                return (0, controllerHelpers_1.sendError)(res, 400, "First name, last name, email, and password are required");
            }
            const [existingUsers] = await database_1.default.execute("SELECT id FROM users WHERE email = ?", [email]);
            if (existingUsers.length > 0) {
                return (0, controllerHelpers_1.sendError)(res, 400, "User already exists with this email");
            }
            const hashedPassword = await bcryptjs_1.default.hash(password, 10);
            const [result] = await database_1.default.execute("INSERT INTO users (first_name, last_name, email, password, phone) VALUES (?, ?, ?, ?, ?)", [first_name, last_name, email, hashedPassword, phone || null]);
            const [userResults] = await database_1.default.execute("SELECT id, first_name, last_name, email, phone, is_admin, created_at, updated_at FROM users WHERE id = ?", [result.insertId]);
            if (userResults.length === 0) {
                return (0, controllerHelpers_1.sendError)(res, 500, "Failed to retrieve user after creation");
            }
            const user = formatUser(userResults[0]);
            const token = generateToken({ id: user.id, email: user.email });
            const authResponse = { token, user };
            (0, controllerHelpers_1.sendSuccess)(res, 201, authResponse);
        }
        catch (error) {
            (0, controllerHelpers_1.sendError)(res, 500, "Server error during signup", error);
        }
    },
    login: async (req, res) => {
        try {
            const { email, password } = req.body;
            console.log("Login attempt for email:", email);
            console.log("Password provided (first 10 chars):", password ? password.substring(0, 10) + "..." : "undefined");
            if (!email || !password) {
                console.log("Missing email or password");
                return (0, controllerHelpers_1.sendError)(res, 400, "Email and password are required");
            }
            const [results] = await database_1.default.execute("SELECT * FROM users WHERE email = ?", [email]);
            console.log("Query results length:", results.length);
            if (results.length === 0) {
                console.log("User not found for email:", email);
                return (0, controllerHelpers_1.sendError)(res, 400, "Invalid email or password");
            }
            const userData = results[0];
            console.log("User found:", userData.email, "Password hash:", userData.password.substring(0, 20) + "...");
            const isPasswordValid = await bcryptjs_1.default.compare(password, userData.password);
            console.log("Password valid:", isPasswordValid);
            if (!isPasswordValid) {
                console.log("Invalid password for user:", email);
                return (0, controllerHelpers_1.sendError)(res, 400, "Invalid email or password");
            }
            const user = formatUser(userData);
            const token = generateToken({
                id: user.id,
                email: user.email,
                isAdmin: user.is_admin,
            });
            const authResponse = { token, user };
            (0, controllerHelpers_1.sendSuccess)(res, 200, authResponse);
        }
        catch (error) {
            (0, controllerHelpers_1.sendError)(res, 500, "Server error during login", error);
        }
    },
    getProfile: async (req, res) => {
        try {
            const userId = req.user?.id;
            const authCheck = (0, controllerHelpers_1.validateUserAuth)(userId);
            if (!authCheck.valid) {
                return (0, controllerHelpers_1.sendError)(res, 401, authCheck.error || "Authentication required");
            }
            const [results] = await database_1.default.execute("SELECT id, first_name, last_name, email, phone, is_admin, profile_picture, created_at, updated_at FROM users WHERE id = ?", [userId]);
            if (results.length === 0) {
                return (0, controllerHelpers_1.sendError)(res, 404, "User not found");
            }
            const user = formatUser(results[0]);
            (0, controllerHelpers_1.sendSuccess)(res, 200, user);
        }
        catch (error) {
            (0, controllerHelpers_1.sendError)(res, 500, "Server error while fetching profile", error);
        }
    },
    updateProfile: async (req, res) => {
        try {
            const userId = req.user?.id;
            const { first_name, last_name, email, phone, } = req.body;
            const authCheck = (0, controllerHelpers_1.validateUserAuth)(userId);
            if (!authCheck.valid) {
                return (0, controllerHelpers_1.sendError)(res, 401, authCheck.error || "Authentication required");
            }
            if (!first_name && !last_name && !email && phone === undefined) {
                return (0, controllerHelpers_1.sendError)(res, 400, "At least one field must be provided for update");
            }
            if (email) {
                const [existingUsers] = await database_1.default.execute("SELECT id FROM users WHERE email = ? AND id != ?", [email, userId]);
                if (existingUsers.length > 0) {
                    return (0, controllerHelpers_1.sendError)(res, 400, "Email is already in use by another user");
                }
            }
            const updates = [];
            const values = [];
            if (first_name) {
                updates.push("first_name = ?");
                values.push(first_name);
            }
            if (last_name) {
                updates.push("last_name = ?");
                values.push(last_name);
            }
            if (email) {
                updates.push("email = ?");
                values.push(email);
            }
            if (phone !== undefined) {
                updates.push("phone = ?");
                values.push(phone || null);
            }
            updates.push("updated_at = NOW()");
            values.push(userId);
            const query = `UPDATE users SET ${updates.join(", ")} WHERE id = ?`;
            await database_1.default.execute(query, values);
            const [results] = await database_1.default.execute("SELECT id, first_name, last_name, email, phone, is_admin, profile_picture, created_at, updated_at FROM users WHERE id = ?", [userId]);
            if (results.length === 0) {
                return (0, controllerHelpers_1.sendError)(res, 404, "User not found after update");
            }
            const user = formatUser(results[0]);
            (0, controllerHelpers_1.sendSuccess)(res, 200, user);
        }
        catch (error) {
            (0, controllerHelpers_1.sendError)(res, 500, "Server error while updating profile", error);
        }
    },
    uploadProfilePicture: async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                return (0, controllerHelpers_1.sendError)(res, 401, "Authentication required");
            }
            if (!req.file) {
                return (0, controllerHelpers_1.sendError)(res, 400, "No file uploaded");
            }
            const filePath = `/uploads/${req.file.filename}`;
            await database_1.default.execute("UPDATE users SET profile_picture = ?, updated_at = NOW() WHERE id = ?", [filePath, userId]);
            (0, controllerHelpers_1.sendSuccess)(res, 200, [{ profile_picture: filePath }]);
        }
        catch (error) {
            (0, controllerHelpers_1.sendError)(res, 500, "Server error while uploading profile picture", error);
        }
    },
    getUsers: async (req, res) => {
        try {
            const userId = req.user?.id;
            const authCheck = (0, controllerHelpers_1.validateUserAuth)(userId);
            if (!authCheck.valid) {
                return (0, controllerHelpers_1.sendError)(res, 401, authCheck.error || "Authentication required");
            }
            const [userResults] = await database_1.default.execute("SELECT is_admin FROM users WHERE id = ?", [userId]);
            if (userResults.length === 0 || !userResults[0].is_admin) {
                return (0, controllerHelpers_1.sendError)(res, 403, "Admin access required");
            }
            const [results] = await database_1.default.execute("SELECT id, first_name, last_name, email, phone, is_admin, profile_picture, created_at, updated_at FROM users ORDER BY created_at DESC");
            const users = results.map(formatUser);
            (0, controllerHelpers_1.sendSuccess)(res, 200, users);
        }
        catch (error) {
            (0, controllerHelpers_1.sendError)(res, 500, "Server error while fetching users", error);
        }
    },
};
exports.default = exports.authController;
//# sourceMappingURL=authController.js.map