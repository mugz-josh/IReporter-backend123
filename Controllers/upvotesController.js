"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upvotesController = void 0;
const database_1 = __importDefault(require("../config/database"));
const controllerHelpers_1 = require("../utils/controllerHelpers");
exports.upvotesController = {
    getUpvotes: async (req, res) => {
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
        SELECT COUNT(*) as count,
               CASE WHEN EXISTS(
                 SELECT 1 FROM upvotes
                 WHERE report_type = ? AND report_id = ? AND user_id = ?
               ) THEN 1 ELSE 0 END as user_upvoted
        FROM upvotes
        WHERE report_type = ? AND report_id = ?
      `;
            const userId = req.user?.id || null;
            const [results] = await database_1.default.execute(query, [reportType, reportId, userId, reportType, reportId]);
            (0, controllerHelpers_1.sendSuccess)(res, 200, results[0]);
        }
        catch (err) {
            (0, controllerHelpers_1.sendError)(res, 500, "Database error", err);
        }
    },
    toggleUpvote: async (req, res) => {
        try {
            const { reportType, reportId } = req.params;
            const userId = req.user?.id;
            if (!reportType || !reportId) {
                (0, controllerHelpers_1.sendError)(res, 400, "Report type and report ID are required");
                return;
            }
            if (!['red_flag', 'intervention'].includes(reportType)) {
                (0, controllerHelpers_1.sendError)(res, 400, "Invalid report type. Must be 'red_flag' or 'intervention'");
                return;
            }
            if (!userId) {
                (0, controllerHelpers_1.sendError)(res, 401, "User authentication required");
                return;
            }
            const reportTable = reportType === 'red_flag' ? 'red_flags' : 'interventions';
            const checkQuery = `SELECT id FROM ${reportTable} WHERE id = ?`;
            const [checkResults] = await database_1.default.execute(checkQuery, [reportId]);
            if (checkResults.length === 0) {
                (0, controllerHelpers_1.sendError)(res, 404, "Report not found");
                return;
            }
            const checkUpvoteQuery = `
        SELECT id FROM upvotes
        WHERE user_id = ? AND report_type = ? AND report_id = ?
      `;
            const [upvoteResults] = await database_1.default.execute(checkUpvoteQuery, [userId, reportType, reportId]);
            let message = "";
            if (upvoteResults.length > 0) {
                const deleteQuery = "DELETE FROM upvotes WHERE user_id = ? AND report_type = ? AND report_id = ?";
                await database_1.default.execute(deleteQuery, [userId, reportType, reportId]);
                message = "Upvote removed";
            }
            else {
                const insertQuery = `
          INSERT INTO upvotes (user_id, report_type, report_id)
          VALUES (?, ?, ?)
        `;
                await database_1.default.execute(insertQuery, [userId, reportType, reportId]);
                message = "Upvote added";
            }
            (0, controllerHelpers_1.sendSuccess)(res, 200, { message });
        }
        catch (err) {
            (0, controllerHelpers_1.sendError)(res, 500, "Database error", err);
        }
    }
};
exports.default = exports.upvotesController;
//# sourceMappingURL=upvotesController.js.map