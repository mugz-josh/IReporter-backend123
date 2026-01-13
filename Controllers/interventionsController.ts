  import { Response } from "express";
import pool from "../config/database";
import {
  AuthRequest,
  CreateRecordData,
  UpdateLocationData,
  UpdateCommentData,
  UpdateStatusData,
  InterventionWithUser,
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

export const interventionsController = {
  
  getAllInterventions: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const userId = req.user?.id;
      const isAdmin = req.user?.isAdmin;

    
      const query = isAdmin
        ? `
          SELECT i.*, u.first_name, u.last_name, u.email 
          FROM interventions i 
          JOIN users u ON i.user_id = u.id 
          ORDER BY i.created_at DESC
        `
        : `
          SELECT i.*, u.first_name, u.last_name, u.email 
          FROM interventions i 
          JOIN users u ON i.user_id = u.id 
          WHERE i.user_id = ?
          ORDER BY i.created_at DESC
        `;

      const [results] = await pool.execute<InterventionWithUser[]>(
        query,
        isAdmin ? [] : [userId]
      );

      
      const interventionsWithParsedMedia = parseMedia(results);

      sendSuccess(res, 200, interventionsWithParsedMedia);
    } catch (err) {
      sendError(res, 500, "Database error", err);
    }
  },

  
  getIntervention: async (req: AuthRequest, res: Response): Promise<void> => {
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
        SELECT i.*, u.first_name, u.last_name, u.email 
        FROM interventions i 
        JOIN users u ON i.user_id = u.id 
        WHERE i.id = ?
      `;

      const [results] = await pool.execute<InterventionWithUser[]>(query, [id]);

      if (results.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Intervention record not found",
        });
        return;
      }

      const intervention = results[0];

      const interventionWithParsedMedia = {
        ...intervention,
        images: intervention?.images ? JSON.parse(intervention.images) : [],
        videos: intervention?.videos ? JSON.parse(intervention?.videos) : [],
      };

      res.status(200).json({
        status: 200,
        data: [interventionWithParsedMedia],
      });
    } catch (err) {
      console.error("Database error:", err);
      res.status(500).json({
        status: 500,
        error: "Database error",
      });
    }
  },

  
  createIntervention: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
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

      // Filter files to images and videos
      const validFiles = files ? files.filter(file =>
        file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')
      ) : [];

      const media =
        validFiles && validFiles.length > 0
          ? processMediaFiles(validFiles)
          : { images: [], videos: [] };

      const query = `
        INSERT INTO interventions (user_id, title, description, latitude, longitude, images, videos)
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
        buildRecordResponse(result.insertId, "Created intervention record")
      );
    } catch (error) {
      sendError(res, 500, "Server error during intervention creation", error);
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
        "SELECT user_id, status, images, videos FROM interventions WHERE id = ?";
      const [checkResults] = await pool.execute<InterventionWithUser[]>(
        checkQuery,
        [id]
      );

      if (checkResults.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Intervention record not found",
        });
        return;
      }

      const intervention = checkResults[0];


      if (intervention?.user_id !== req.user?.id && !req.user?.isAdmin) {
        res.status(403).json({
          status: 403,
          error: "Access denied. You can only modify your own records.",
        });
        return;
      }


      if (intervention?.status !== "draft") {
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

      const existingImages = intervention.images
        ? JSON.parse(intervention.images)
        : [];
      const existingVideos = intervention.videos
        ? JSON.parse(intervention.videos)
        : [];

      const newImages = imageFiles.map((file) => file.filename);
      const newVideos = videoFiles.map((file) => file.filename);

      const updatedImages = [...existingImages, ...newImages];
      const updatedVideos = [...existingVideos, ...newVideos];


      const updateQuery =
        "UPDATE interventions SET images = ?, videos = ? WHERE id = ?";
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
            message: `Added ${newImages.length} images and ${newVideos.length} videos to intervention record`,
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

      
      const checkQuery =
        "SELECT user_id, status FROM interventions WHERE id = ?";
      const [checkResults] = await pool.execute<InterventionWithUser[]>(
        checkQuery,
        [id]
      );

      if (checkResults.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Intervention record not found",
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
        "UPDATE interventions SET latitude = ?, longitude = ? WHERE id = ?";
      await pool.execute(updateQuery, [latitude, longitude, id]);

      res.status(200).json({
        status: 200,
        data: [
          {
            id: parseInt(id),
            message: "Updated intervention record's location",
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

      
      const checkQuery =
        "SELECT user_id, status FROM interventions WHERE id = ?";
      const [checkResults] = await pool.execute<InterventionWithUser[]>(
        checkQuery,
        [id]
      );

      if (checkResults.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Intervention record not found",
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
        "UPDATE interventions SET description = ? WHERE id = ?";
      await pool.execute(updateQuery, [description, id]);

      res.status(200).json({
        status: 200,
        data: [
          {
            id: parseInt(id),
            message: "Updated intervention record's comment",
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

  
  deleteIntervention: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    try {
      const { id } = req.params;

      if (!id) {
        res.status(400).json({
          status: 400,
          error: "ID parameter is required",
        });
        return;
      }

      
      const checkQuery =
        "SELECT user_id, status FROM interventions WHERE id = ?";
      const [checkResults] = await pool.execute<InterventionWithUser[]>(
        checkQuery,
        [id]
      );

      if (checkResults.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Intervention record not found",
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

      const deleteQuery = "DELETE FROM interventions WHERE id = ?";
      await pool.execute(deleteQuery, [id]);

      res.status(200).json({
        status: 200,
        data: [
          {
            id: parseInt(id),
            message: "Intervention record has been deleted",
          },
        ],
      });
    } catch (error) {
      console.error("Error deleting intervention:", error);
      res.status(500).json({
        status: 500,
        error: "Failed to delete intervention record",
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

      
      const [rows] = await pool.execute<InterventionWithUser[]>(
        "SELECT i.*, u.email FROM interventions i JOIN users u ON i.user_id = u.id WHERE i.id = ?",
        [id]
      );

      if ((rows as any).length === 0) {
        res
          .status(404)
          .json({ status: 404, error: "Intervention record not found" });
        return;
      }
      const report = (rows as any)[0];

      const query = "UPDATE interventions SET status = ? WHERE id = ?";
      const [result] = await pool.execute<ResultSetHeader>(query, [status, id]);

      if (result.affectedRows === 0) {
        res.status(404).json({
          status: 404,
          error: "Intervention record not found",
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
          `Your intervention "${report.title}" status changed to "${status}"`,
          "info",
          "intervention",
          parseInt(id, 10),
        ]);
      } catch (nErr) {
        console.error(
          "Failed to create notification after status change:",
          
        );
      }

   try {
        await EmailService.sendReportStatusNotification(
          report.email,
          "intervention", 
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
            message: "Updated intervention record status",
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

  
  updateIntervention: async (
    req: AuthRequest,
    res: Response
  ): Promise<void> => {
    const startTime = Date.now();
    console.log(`🔄 Starting updateIntervention for ID: ${req.params.id}`);
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
        "SELECT user_id, status, images, videos FROM interventions WHERE id = ?";
      const [checkResults] = await pool.execute<InterventionWithUser[]>(
        checkQuery,
        [id]
      );
      console.log(`✅ Record check took ${Date.now() - checkStart}ms`);

      if (checkResults.length === 0) {
        res.status(404).json({
          status: 404,
          error: "Intervention record not found",
        });
        return;
      }

      const intervention = checkResults[0];

      if (intervention?.user_id !== req.user?.id && !req.user?.isAdmin) {
        res.status(403).json({
          status: 403,
          error: "Access denied. You can only modify your own records.",
        });
        return;
      }

      if (intervention?.status !== "draft") {
        res.status(403).json({
          status: 403,
          error:
            "Cannot modify record that is under investigation, rejected, or resolved",
        });
        return;
      }

      let updatedImages = intervention.images
        ? JSON.parse(intervention.images)
        : [];
      let updatedVideos = intervention.videos
        ? JSON.parse(intervention.videos)
        : [];

      if (files && files.length > 0) {
        console.log(`📁 Processing ${files.length} files...`);
        const fileStart = Date.now();
        // Filter files to images and videos
        const validFiles = files.filter(file =>
          file.mimetype.startsWith('image/') || file.mimetype.startsWith('video/')
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
        UPDATE interventions
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
            message: "Updated intervention record",
          },
        ],
      });
    } catch (error) {
      console.error("Error updating intervention:", error);
      res.status(500).json({
        status: 500,
        error: "Server error during intervention update",
      });
    }
  },
};

export default interventionsController;
