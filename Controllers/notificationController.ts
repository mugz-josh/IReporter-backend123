import { Response } from "express";
import pool from "../config/database";
import { AuthRequest, ApiResponse } from "../types";

const notificationController = {createNotificationForUser: async (payload: {
    user_id: number;
    title: string;
    message: string;
    type?: string;
    related_entity_type?: string;
    related_entity_id?: number;
  }) => {const {user_id,title,message,type = "info",related_entity_type = null,related_entity_id = null,} = payload as any; const query = `
         INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
          VALUES (?, ?, ?, ?, ?, ?)`;
    await pool.execute(query, [ user_id, title, message, type, related_entity_type, related_entity_id,]);},
     getUserNotifications: async ( req: AuthRequest, res: Response ): Promise<void> => { try {const userId = req.user?.id;
      if (!userId) { const response: ApiResponse = {status: 401,error: "Authentication required",};
        res.status(401).json(response);
        return;}

    const query = `SELECT id, title, message, type, is_read, related_entity_type, related_entity_id, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC`;
    const [results] = (await pool.execute(query, [userId])) as any;

    res.status(200).json({ status: 200, data: results });
    } catch (err) {console.error("Error fetching notifications:", err);
      res.status(500).json({ status: 500, error: "Failed to fetch notifications" }); }},

    markAllAsRead: async (req: AuthRequest, res: Response): Promise<void> => {try {const userId = req.user?.id;
      if (!userId) {const response: ApiResponse = {status: 401,error: "Authentication required",};
        res.status(401).json(response);
        return;}

     const query ="UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0";
      await pool.execute(query, [userId]);

     res.status(200) .json({status: 200,data: [{ message: "Marked notifications as read" }],});
    } catch (err) {console.error("Error marking notifications as read:", err);
      res.status(500).json({ status: 500, error: "Failed to mark notifications as read" });} },

  deleteNotification: async (req: AuthRequest,res: Response): Promise<void> => {try {const userId = req.user?.id;
  const notificationIdParam = req.params.id;

  if (!userId) {const response: ApiResponse = {status: 401,error: "Authentication required",};
     res.status(401).json(response);
        return;}

  if (!notificationIdParam) {const response: ApiResponse = {status: 400,error: "Notification ID required",};
      res.status(400).json(response);
      return;}

   const notificationId = parseInt(notificationIdParam);
      if (isNaN(notificationId)) {const response: ApiResponse = { status: 400, error: "Invalid notification ID",};
        res.status(400).json(response);
        return;}

     const query = "DELETE FROM notifications WHERE id = ? AND user_id = ?";
      const [result] = (await pool.execute(query, [notificationId,userId,])) as any;

    if (result.affectedRows === 0) {res.status(404).json({ status: 404, error: "Notification not found" });
        return;}
      res.status(200).json({status: 200,data: [{ message: "Notification deleted successfully" }],});
    } catch (err) {
      console.error("Error deleting notification:", err);
      res .status(500) .json({ status: 500, error: "Failed to delete notification" });}
},
  deleteOldNotifications: async (daysOld: number = 30): Promise<void> => {try {const query ="DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)";
      const [result] = (await pool.execute(query, [daysOld])) as any;
      console.log( `Deleted ${result.affectedRows} notifications older than ${daysOld} days`);} catch (err) {console.error("Error deleting old notifications:", err);
    }
  },
};
export default notificationController;
              