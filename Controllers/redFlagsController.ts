import { Response } from "express";
import pool from "../config/database";
import {
  AuthRequest,
  CreateRecordData,
  UpdateLocationData,
  UpdateCommentData,
  UpdateStatusData,
  RedFlagWithUser,
} from "../types";
import { ResultSetHeader } from "mysql2";
import EmailService from "../services/emailService";
import {
  sendError,
  sendSuccess,
  processMediaFiles,
  parseMedia,
  validateCreateRecord,
  validateUserAuth,
  buildRecordResponse,
} from "../utils/controllerHelpers";

export const redFlagsController = {
  getAllRedFlags: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.user?.id;
      const isAdmin = req.user?.isAdmin;

      const query = isAdmin
        ? `
          SELECT rf.*, u.first_name, u.last_name, u.email 
          FROM red_flags rf 
          JOIN users u ON rf.user_id = u.id 
          ORDER BY rf.created_at DESC
        `
        : `
          SELECT rf.*, u.first_name, u.last_name, u.email 
          FROM red_flags rf 
          JOIN users u ON rf.user_id = u.id 
          WHERE rf.user_id = ?
          ORDER BY rf.created_at DESC
        `;

      const [results] = await pool.execute<RedFlagWithUser[]>(
        query,
        isAdmin ? [] : [userId]
      );

      const redFlagsWithParsedMedia = parseMedia(results);

      sendSuccess(res, 200, redFlagsWithParsedMedia);
    } catch (err) {
      sendError(res, 500, "Database error", err);
    }
  },

  getRedFlag: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          status: 400,
          error: "ID parameter is required",
        });
        return;
      }

      const query = `
        SELECT rf.*, u.first_name, u.last_name, u.email 
        FROM red_flags rf 
        JOIN users u ON rf.user_id = u.id 
        WHERE rf.id = ?
      `;

      const [results] = await pool.execute<RedFlagWithUser[]>(query, [id]);

      if (results.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Red-flag record not found",
        });
        return;
      }

      const redFlag = results[0];

      const redFlagWithParsedMedia = {
        ...redFlag,
        images: redFlag?.images ? JSON.parse(redFlag.images) : [],
        videos: redFlag?.videos ? JSON.parse(redFlag.videos) : [],
      };

      res.status(200).json({
        status: 200,
        data: [redFlagWithParsedMedia],
      });
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({
        status: 500,
        error: "Database error",
      });
    }
  },

  createRedFlag: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { title, description, latitude, longitude }: CreateRecordData =
        req.body;
      const userId = req.user?.id;
      const files = req.files as Express.Multer.File[];

      const authCheck = validateUserAuth(userId);
      if (!authCheck.valid) {
        sendError(res, 401, authCheck.error!);
        return;
      }

      const validation = validateCreateRecord(
        title,
        description,
        latitude,
        longitude
      );
      if (!validation.valid) {
        sendError(res, 400, validation.error!);
        return;
      }

      // Filter files to images, videos, and audio
      const validFiles = files ? files.filter(file =>
        file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')
      ) : [];

      const media =
        validFiles && validFiles.length > 0
          ? processMediaFiles(validFiles)
          : { images: [], videos: [], audio: [] };

      const query = `
        INSERT INTO red_flags (user_id, title, description, latitude, longitude, images, videos)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await pool.execute<ResultSetHeader>(query, [
        userId,
        title,
        description,
        latitude,
        longitude,
        media.images.length > 0 ? JSON.stringify(media.images) : null,
        media.videos.length > 0 ? JSON.stringify(media.videos) : null,
      ]);

      sendSuccess(
        res,
        201,
        buildRecordResponse(result.insertId, "Created red-flag record")
      );
    } catch (error) {
      sendError(res, 500, "Server error during red-flag creation", error);
    }
  },

  addMedia: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const files = req.files as Express.Multer.File[];

      if (!id) {
        res.status(400).json({
          status: 400,
          error: "ID parameter is required",
        });
        return;
      }

      if (!files || files.length === 0) {
        res.status(400).json({
          status: 400,
          error: "No files uploaded",
        });
        return;
      }

      const checkQuery =
        "SELECT user_id, status, images, videos FROM red_flags WHERE id = ?";
      const [checkResults] = await pool.execute<RedFlagWithUser[]>(checkQuery, [
        id,
      ]);

      if (checkResults.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Red-flag record not found",
        });
        return;
      }

      const redFlag = checkResults[0];

      if (redFlag?.user_id !== req.user?.id && !req.user?.isAdmin) {
        res.status(403).json({
          status: 403,
          error: "Access denied. You can only modify your own records.",
        });
        return;
      }

      if (redFlag?.status !== "draft") {
        res.status(403).json({
          status: 403,
          error:
            "Cannot modify record that is under investigation, rejected, or resolved",
        });
        return;
      }

      const imageFiles = files.filter((file) =>
        file.mimetype.startsWith("image/")
      );
      const videoFiles = files.filter((file) =>
        file.mimetype.startsWith("video/")
      );

      const existingImages = redFlag.images ? JSON.parse(redFlag.images) : [];
      const existingVideos = redFlag.videos ? JSON.parse(redFlag.videos) : [];

      const newImages = imageFiles.map((file) => file.filename);
      const newVideos = videoFiles.map((file) => file.filename);

      const updatedImages = [...existingImages, ...newImages];
      const updatedVideos = [...existingVideos, ...newVideos];

      const updateQuery =
        "UPDATE red_flags SET images = ?, videos = ?, audio = ? WHERE id = ?";
      await pool.execute(updateQuery, [
        updatedImages.length > 0 ? JSON.stringify(updatedImages) : null,
        updatedVideos.length > 0 ? JSON.stringify(updatedVideos) : null,
        
        id,
      ]);

      res.status(200).json({
        status: 200,
        data: [
          {
            id: parseInt(id),
            message: `Added ${newImages.length} images and ${newVideos.length} videos to red-flag record`,
          },
        ],
      });
    } catch (error) {
      console.error("Error adding media:", error);
      res.status(500).json({
        status: 500,
        error: "Server error during media upload",
      });
    }
  },

  updateLocation: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { latitude, longitude }: UpdateLocationData = req.body;

      if (!id) {
        res.status(400).json({
          status: 400,
          error: "ID parameter is required",
        });
        return;
      }

      const checkQuery = "SELECT user_id, status FROM red_flags WHERE id = ?";
      const [checkResults] = await pool.execute<RedFlagWithUser[]>(checkQuery, [
        id,
      ]);

      if (checkResults.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Red-flag record not found",
        });
        return;
      }

      const record = checkResults[0];

      if (record?.user_id !== req.user?.id && !req.user?.isAdmin) {
        res.status(403).json({
          status: 403,
          error: "Access denied. You can only modify your own records.",
        });
        return;
      }

      if (record?.status !== "draft") {
        res.status(403).json({
          status: 403,
          error:
            "Cannot modify record that is under investigation, rejected, or resolved",
        });
        return;
      }

      const updateQuery =
        "UPDATE red_flags SET latitude = ?, longitude = ? WHERE id = ?";
      await pool.execute(updateQuery, [latitude, longitude, id]);

      res.status(200).json({
        status: 200,
        data: [
          {
            id: parseInt(id),
            message: "Updated red-flag record's location",
          },
        ],
      });
    } catch (error) {
      console.error("Error updating location:", error);
      res.status(500).json({
        status: 500,
        error: "Failed to update location",
      });
    }
  },

  updateComment: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { description }: UpdateCommentData = req.body;

      if (!id) {
        res.status(400).json({
          status: 400,
          error: "ID parameter is required",
        });
        return;
      }

      const checkQuery = "SELECT user_id, status FROM red_flags WHERE id = ?";
      const [checkResults] = await pool.execute<RedFlagWithUser[]>(checkQuery, [
        id,
      ]);

      if (checkResults.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Red-flag record not found",
        });
        return;
      }

      const record = checkResults[0];

      if (record?.user_id !== req.user?.id && !req.user?.isAdmin) {
        res.status(403).json({
          status: 403,
          error: "Access denied. You can only modify your own records.",
        });
        return;
      }

      if (record?.status !== "draft") {
        res.status(403).json({
          status: 403,
          error:
            "Cannot modify record that is under investigation, rejected, or resolved",
        });
        return;
      }

      const updateQuery = "UPDATE red_flags SET description = ? WHERE id = ?";
      await pool.execute(updateQuery, [description, id]);

      res.status(200).json({
        status: 200,
        data: [
          {
            id: parseInt(id),
            message: "Updated red-flag record's comment",
          },
        ],
      });
    } catch (error) {
      console.error("Error updating comment:", error);
      res.status(500).json({
        status: 500,
        error: "Failed to update comment",
      });
    }
  },

  deleteRedFlag: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          status: 400,
          error: "ID parameter is required",
        });
        return;
      }

      const checkQuery = "SELECT user_id, status FROM red_flags WHERE id = ?";
      const [checkResults] = await pool.execute<RedFlagWithUser[]>(checkQuery, [
        id,
      ]);

      if (checkResults.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Red-flag record not found",
        });
        return;
      }

      const record = checkResults[0];

      if (record?.user_id !== req.user?.id && !req.user?.isAdmin) {
        res.status(403).json({
          status: 403,
          error: "Access denied. You can only delete your own records.",
        });
        return;
      }

      if (record?.status !== "draft") {
        res.status(403).json({
          status: 403,
          error:
            "Cannot delete record that is under investigation, rejected, or resolved",
        });
        return;
      }

      const deleteQuery = "DELETE FROM red_flags WHERE id = ?";
      await pool.execute(deleteQuery, [id]);

      res.status(200).json({
        status: 200,
        data: [
          {
            id: parseInt(id),
            message: "Red-flag record has been deleted",
          },
        ],
      });
    } catch (error) {
      console.error("Error deleting red flag:", error);
      res.status(500).json({
        status: 500,
        error: "Failed to delete red-flag record",
      });
    }
  },

  updateStatus: async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const { status }: UpdateStatusData = req.body;

      if (!id) {
        res.status(400).json({
          status: 400,
          error: "ID parameter is required",
        });
        return;
      }

      const validStatuses = ["under-investigation", "rejected", "resolved"];
      if (!status || !validStatuses.includes(status)) {
        res.status(400).json({
          status: 400,
          error:
            "Invalid status. Must be one of: under-investigation, rejected, resolved",
        });
        return;
      }

      const [rows] = await pool.execute<RedFlagWithUser[]>(
        "SELECT rf.*, u.email FROM red_flags rf JOIN users u ON rf.user_id = u.id WHERE rf.id = ?",
        [id]
      );

      if ((rows as any).length === 0) {
        res
          .status(404)
          .json({ status: 404, error: "Red-flag record not found" });
        return;
      }
      const report = (rows as any)[0];

      const query = "UPDATE red_flags SET status = ? WHERE id = ?";
      const [result] = await pool.execute<ResultSetHeader>(query, [status, id]);

      if (result.affectedRows === 0) {
        res.status(404).json({
          status: 404,
          error: "Red-flag record not found",
        });
        return;
      }
      try {
        const notificationQuery = `
          INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
          VALUES (?, ?, ?, ?, ?, ?)
        `;
        await pool.execute(notificationQuery, [
          report.user_id,
          "Report status updated",
          `Your report "${report.title}" status changed to "${status}"`,
          "info",
          "red_flag",
          parseInt(id, 10),
        ]);
      } catch (nErr) {
        console.error("Failed to create notification after status change:");
      }
      try {
        await EmailService.sendReportStatusNotification(
          report.email,
          "redflag",
          report.title,
          report.status,
          status
        );
      } catch (emailError) {
        console.error("Failed to send email notification:", emailError);
      }
      res.status(200).json({
        status: 200,
        data: [
          {
            id: parseInt(id),
            message: "Updated red-flag record status",
          },
        ],
      });
    } catch (error) {
      console.error("Error updating status:", error);
      res.status(500).json({
        status: 500,
        error: "Failed to update status",
      });
    }
  },


  updateRedFlag: async (req: AuthRequest, res: Response): Promise<void> => {
    const startTime = Date.now();
    console.log(`🔄 Starting updateRedFlag for ID: ${req.params.id}`);
    try {
      const { id } = req.params;
      const { title, description, latitude, longitude }: CreateRecordData =
        req.body;
      const files = req.files as Express.Multer.File[];

      if (!id) {
        res.status(400).json({
          status: 400,
          error: "ID parameter is required",
        });
        return;
      }

      console.log(`⏳ Checking record existence...`);
      const checkStart = Date.now();
      const checkQuery =
        "SELECT user_id, status, images, videos FROM red_flags WHERE id = ?";
      const [checkResults] = await pool.execute<RedFlagWithUser[]>(checkQuery, [
        id,
      ]);
      console.log(`✅ Record check took ${Date.now() - checkStart}ms`);

      if (checkResults.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Red-flag record not found",
        });
        return;
      }

      const redFlag = checkResults[0];

      if (redFlag?.user_id !== req.user?.id && !req.user?.isAdmin) {
        res.status(403).json({
          status: 403,
          error: "Access denied. You can only modify your own records.",
        });
        return;
      }
      if (redFlag?.status !== "draft") {
        res.status(403).json({
          status: 403,
          error:
            "Cannot modify record that is under investigation, rejected, or resolved",
        });
        return;
      }
      let updatedImages = redFlag.images ? JSON.parse(redFlag.images) : [];
      let updatedVideos = redFlag.videos ? JSON.parse(redFlag.videos) : [];
      let updatedAudio = redFlag.audio ? JSON.parse(redFlag.audio) : [];

      if (files && files.length > 0) {
        console.log(`📁 Processing ${files.length} files...`);
        const fileStart = Date.now();
        // Filter files to images, videos, and audio
        const validFiles = files.filter(file =>
          file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/') || file.mimetype.startsWith('audio/')
        );

        const imageFiles = validFiles.filter((file) =>
          file.mimetype.startsWith("image/")
        );
        const videoFiles = validFiles.filter((file) =>
          file.mimetype.startsWith("video/")
        );

        updatedImages = imageFiles.map((file) => file.filename);
        updatedVideos = videoFiles.map((file) => file.filename);
        console.log(`✅ File processing took ${Date.now() - fileStart}ms`);
      } else {
        console.log(`📁 No new files uploaded, keeping existing media`);
      }

      console.log(`💾 Updating database...`);
      const dbStart = Date.now();
      const updateQuery = `
        UPDATE red_flags
        SET title = ?, description = ?, latitude = ?, longitude = ?, images = ?, videos = ?
        WHERE id = ?
      `;

      await pool.execute(updateQuery, [
        title,
        description,
        latitude,
        longitude,
        updatedImages.length > 0 ? JSON.stringify(updatedImages) : null,
        updatedVideos.length > 0 ? JSON.stringify(updatedVideos) : null,
        id,
      ]);
      console.log(`✅ Database update took ${Date.now() - dbStart}ms`);

      console.log(`🎉 Total update time: ${Date.now() - startTime}ms`);
      res.status(200).json({
        status: 200,
        data: [
          {
            id: parseInt(id),
            message: "Updated red-flag record",
          },
        ],
      });
    } catch (error) {
      console.error("Error updating red flag:", error);
      res.status(500).json({
        status: 500,
        error: "Server error during red-flag update",
      });
    }
  },
};

export default redFlagsController;
