import { Response } from "express";
import pool from "../config/database";
import { AuthRequest } from "../types";
import { ResultSetHeader } from "mysql2";
import { sendError, sendSuccess } from "../utils/controllerHelpers";

export const commentsController = {
  // Get all comments for a specific report
  getComments: async (req: AuthRequest, res: Response): Promise<void> => {
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
        SELECT c.*, u.first_name, u.last_name, u.profile_picture
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.report_type = ? AND c.report_id = ?
        ORDER BY c.created_at ASC
      `;

      const [results] = await pool.execute(query, [reportType, reportId]);

      sendSuccess(res, 200, results);
    } catch (err) {
      sendError(res, 500, "Database error", err);
    }
  },

  // Add a new comment to a report
  addComment: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { reportType, reportId } = req.params;
      const { comment_text, comment_type } = req.body;
      const userId = req.user?.id;
      const isAdmin = req.user?.isAdmin;

      if (!reportType || !reportId) {
        sendError(res, 400, "Report type and report ID are required");
        return;
      }

      if (!['red_flag', 'intervention'].includes(reportType)) {
        sendError(res, 400, "Invalid report type. Must be 'red_flag' or 'intervention'");
        return;
      }

      if (!comment_text || comment_text.trim().length === 0) {
        sendError(res, 400, "Comment text is required");
        return;
      }

      if (!userId) {
        sendError(res, 401, "User authentication required");
        return;
      }

      // Determine comment type
      let finalCommentType = 'user';
      if (isAdmin) {
        if (comment_type === 'official') {
          finalCommentType = 'official';
        } else {
          finalCommentType = 'admin';
        }
      }

      // Verify the report exists
      const reportTable = reportType === 'red_flag' ? 'red_flags' : 'interventions';
      const checkQuery = `SELECT id FROM ${reportTable} WHERE id = ?`;
      const [checkResults] = await pool.execute(checkQuery, [reportId]);

      if ((checkResults as any[]).length === 0) {
        sendError(res, 404, "Report not found");
        return;
      }

      const insertQuery = `
        INSERT INTO comments (user_id, report_type, report_id, comment_text, comment_type)
        VALUES (?, ?, ?, ?, ?)
      `;

      const [result] = await pool.execute<ResultSetHeader>(insertQuery, [
        userId,
        reportType,
        reportId,
        comment_text.trim(),
        finalCommentType
      ]);

      // Get the inserted comment with user info
      const selectQuery = `
        SELECT c.*, u.first_name, u.last_name, u.profile_picture
        FROM comments c
        JOIN users u ON c.user_id = u.id
        WHERE c.id = ?
      `;

      const [commentResults] = await pool.execute(selectQuery, [result.insertId]);

      sendSuccess(res, 201, (commentResults as any[])[0]);
    } catch (err) {
      sendError(res, 500, "Database error", err);
    }
  },

  // Delete a comment (only by the comment author or admin)
  deleteComment: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { commentId } = req.params;
      const userId = req.user?.id;
      const isAdmin = req.user?.isAdmin;

      if (!commentId) {
        sendError(res, 400, "Comment ID is required");
        return;
      }

      if (!userId) {
        sendError(res, 401, "User authentication required");
        return;
      }

      // Check if comment exists and get author
      const checkQuery = "SELECT user_id FROM comments WHERE id = ?";
      const [checkResults] = await pool.execute(checkQuery, [commentId]);

      if ((checkResults as any[]).length === 0) {
        sendError(res, 404, "Comment not found");
        return;
      }

      const comment = (checkResults as any[])[0];

      // Only allow deletion by comment author or admin
      if (comment.user_id !== userId && !isAdmin) {
        sendError(res, 403, "You can only delete your own comments");
        return;
      }

      const deleteQuery = "DELETE FROM comments WHERE id = ?";
      await pool.execute(deleteQuery, [commentId]);

      sendSuccess(res, 200, { message: "Comment deleted successfully" });
    } catch (err) {
      sendError(res, 500, "Database error", err);
    }
  }
};

export default commentsController;
