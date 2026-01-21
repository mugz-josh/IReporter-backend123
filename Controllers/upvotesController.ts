import { Response } from "express";
import pool from "../config/database";
import { AuthRequest } from "../types";
import { sendError, sendSuccess } from "../utils/controllerHelpers";

export const upvotesController = {
  // Get upvotes count for a specific report
  getUpvotes: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { reportType, reportId } = req.params;

      if (!reportType || !reportId) {
        sendError(res, 400, "Report type and report ID are required");
        return;
      }

      if (!['red_flag', 'intervention'].includes(reportType)) {
        sendError(res, 400, "Invalid report type. Must be 'red_flag' or 'intervention'");
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
      const [results] = await pool.execute(query, [reportType, reportId, userId, reportType, reportId]);

      sendSuccess(res, 200, (results as any[])[0]);
    } catch (err) {
      sendError(res, 500, "Database error", err);
    }
  },

  // Add or remove an upvote (toggle)
  toggleUpvote: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { reportType, reportId } = req.params;
      const userId = req.user?.id;

      if (!reportType || !reportId) {
        sendError(res, 400, "Report type and report ID are required");
        return;
      }

      if (!['red_flag', 'intervention'].includes(reportType)) {
        sendError(res, 400, "Invalid report type. Must be 'red_flag' or 'intervention'");
        return;
      }

      if (!userId) {
        sendError(res, 401, "User authentication required");
        return;
      }

      // Verify the report exists
      const reportTable = reportType === 'red_flag' ? 'red_flags' : 'interventions';
      const checkQuery = `SELECT id FROM ${reportTable} WHERE id = $1`;
      const checkResults = await pool.query(checkQuery, [reportId]);

      if (checkResults.rows.length === 0) {
        sendError(res, 404, "Report not found");
        return;
      }

      // Check if upvote already exists
      const checkUpvoteQuery = `
        SELECT id FROM upvotes
        WHERE user_id = $1 AND report_type = $2 AND report_id = $3
      `;
      const upvoteResults = await pool.query(checkUpvoteQuery, [userId, reportType, reportId]);

      let message = "";
      if (upvoteResults.rows.length > 0) {
        // Remove upvote
        const deleteQuery = "DELETE FROM upvotes WHERE user_id = $1 AND report_type = $2 AND report_id = $3";
        await pool.query(deleteQuery, [userId, reportType, reportId]);
        message = "Upvote removed";
      } else {
        // Add upvote
        const insertQuery = `
          INSERT INTO upvotes (user_id, report_type, report_id)
          VALUES ($1, $2, $3)
        `;
        await pool.query(insertQuery, [userId, reportType, reportId]);
        message = "Upvote added";
      }

      sendSuccess(res, 200, { message });
    } catch (err) {
      sendError(res, 500, "Database error", err);
    }
  }
};

export default upvotesController;
