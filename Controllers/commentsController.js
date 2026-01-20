"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commentsController = void 0;
const database_1 = __importDefault(require("../config/database"));
const controllerHelpers_1 = require("../utils/controllerHelpers");
exports.commentsController = {
    getComments: async (req, res) => {
        try {
            const { reportType, reportId } = req.params;
            if (!reportType || !reportId) {
                (0, controllerHelpers_1.sendError)(res, 400, "Report type and report ID are required");
                return;
            }
            if (!['red_flag', 'intervention'].includes(reportType)) {
                (0, controllerHelpers_1.sendError)(res, 400, "Invalid report type. Must be 'red_flag' or 'intervention'");
                return;
            }
            const query = `
        SELECT c.*, u.first_name, u.last_name, u.profile_picture
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.report_type = ? AND c.report_id = ?
        ORDER BY c.created_at ASC
      `;
            const [results] = await database_1.default.execute(query, [reportType, reportId]);
            (0, controllerHelpers_1.sendSuccess)(res, 200, results);
        }
        catch (err) {
            (0, controllerHelpers_1.sendError)(res, 500, "Database error", err);
        }
    },
    addComment: async (req, res) => {
        try {
            const { reportType, reportId } = req.params;
            const { comment_text, comment_type } = req.body;
            const userId = req.user?.id;
            const isAdmin = req.user?.isAdmin;
            if (!reportType || !reportId) {
                (0, controllerHelpers_1.sendError)(res, 400, "Report type and report ID are required");
                return;
            }
            if (!['red_flag', 'intervention'].includes(reportType)) {
                (0, controllerHelpers_1.sendError)(res, 400, "Invalid report type. Must be 'red_flag' or 'intervention'");
                return;
            }
            if (!comment_text || comment_text.trim().length === 0) {
                (0, controllerHelpers_1.sendError)(res, 400, "Comment text is required");
                return;
            }
            if (!userId) {
                (0, controllerHelpers_1.sendError)(res, 401, "User authentication required");
                return;
            }
            let finalCommentType = 'user';
            if (isAdmin) {
                if (comment_type === 'official') {
                    finalCommentType = 'official';
                }
                else {
                    finalCommentType = 'admin';
                }
            }
            const reportTable = reportType === 'red_flag' ? 'red_flags' : 'interventions';
            const checkQuery = `SELECT id FROM ${reportTable} WHERE id = ?`;
            const [checkResults] = await database_1.default.execute(checkQuery, [reportId]);
            if (checkResults.length === 0) {
                (0, controllerHelpers_1.sendError)(res, 404, "Report not found");
                return;
            }
            const insertQuery = `
        INSERT INTO comments (user_id, report_type, report_id, comment_text, comment_type)
        VALUES (?, ?, ?, ?, ?)
      `;
            const [result] = await database_1.default.execute(insertQuery, [
                userId,
                reportType,
                reportId,
                comment_text.trim(),
                finalCommentType
            ]);
            const selectQuery = `
        SELECT c.*, u.first_name, u.last_name, u.profile_picture
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `;
            const [commentResults] = await database_1.default.execute(selectQuery, [result.insertId]);
            (0, controllerHelpers_1.sendSuccess)(res, 201, commentResults[0]);
        }
        catch (err) {
            (0, controllerHelpers_1.sendError)(res, 500, "Database error", err);
        }
    },
    deleteComment: async (req, res) => {
        try {
            const { commentId } = req.params;
            const userId = req.user?.id;
            const isAdmin = req.user?.isAdmin;
            if (!commentId) {
                (0, controllerHelpers_1.sendError)(res, 400, "Comment ID is required");
                return;
            }
            if (!userId) {
                (0, controllerHelpers_1.sendError)(res, 401, "User authentication required");
                return;
            }
            const checkQuery = "SELECT user_id FROM comments WHERE id = ?";
            const [checkResults] = await database_1.default.execute(checkQuery, [commentId]);
            if (checkResults.length === 0) {
                (0, controllerHelpers_1.sendError)(res, 404, "Comment not found");
                return;
            }
            const comment = checkResults[0];
            if (comment.user_id !== userId && !isAdmin) {
                (0, controllerHelpers_1.sendError)(res, 403, "You can only delete your own comments");
                return;
            }
            const deleteQuery = "DELETE FROM comments WHERE id = ?";
            await database_1.default.execute(deleteQuery, [commentId]);
            (0, controllerHelpers_1.sendSuccess)(res, 200, { message: "Comment deleted successfully" });
        }
        catch (err) {
            (0, controllerHelpers_1.sendError)(res, 500, "Database error", err);
        }
    }
};
exports.default = exports.commentsController;
//# sourceMappingURL=commentsController.js.map