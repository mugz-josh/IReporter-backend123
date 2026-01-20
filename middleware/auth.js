"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.auth = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const database_1 = __importDefault(require("../config/database"));
exports.auth = { verifyToken: (req, res, next) => {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
            const response = { status: 401, error: "Access denied. No token provided.", };
            res.status(401).json(response);
            return;
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        }
        catch (err) {
            const response = { status: 400, error: "Invalid token.", };
            res.status(400).json(response);
        }
    }, isAdmin: async (req, res, next) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                const response = { status: 401, error: "Authentication required.", };
                res.status(401).json(response);
                return;
            }
            const query = "SELECT is_admin FROM users WHERE id = ?";
            const [results] = (await database_1.default.execute(query, [userId]));
            if (results.length === 0 || !results[0].is_admin) {
                const response = { status: 403, error: "Access denied. Admin privileges required.", };
                res.status(403).json(response);
                return;
            }
            next();
        }
        catch (err) {
            const response = {
                status: 500,
                error: "Database error",
            };
            res.status(500).json(response);
        }
    },
    checkRecordOwnership: (table) => {
        return async (req, res, next) => {
            try {
                const recordId = req.params.id;
                const userId = req.user?.id;
                if (!userId) {
                    const response = { status: 401, error: "Authentication required.", };
                    res.status(401).json(response);
                    return;
                }
                const query = `SELECT user_id FROM ${table} WHERE id = ?`;
                const [results] = (await database_1.default.execute(query, [recordId]));
                if (results.length === 0) {
                    const response = { status: 404, error: "Record not found", };
                    res.status(404).json(response);
                    return;
                }
                if (results[0].user_id !== userId && !req.user?.isAdmin) {
                    const response = { status: 403, error: "Access denied. You can only modify your own records.", };
                    res.status(403).json(response);
                    return;
                }
                next();
            }
            catch (err) {
                const response = {
                    status: 500,
                    error: "Database error",
                };
                res.status(500).json(response);
            }
        };
    },
};
exports.default = exports.auth;
//# sourceMappingURL=auth.js.map