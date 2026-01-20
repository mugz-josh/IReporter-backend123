"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const database_1 = __importDefault(require("../config/database"));
const notificationController = { createNotificationForUser: async (payload) => {
        const { user_id, title, message, type = "info", related_entity_type = null, related_entity_id = null, } = payload;
        const query = `
         INSERT INTO notifications (user_id, title, message, type, related_entity_type, related_entity_id)
          VALUES (?, ?, ?, ?, ?, ?)`;
        await database_1.default.execute(query, [user_id, title, message, type, related_entity_type, related_entity_id,]);
    },
    getUserNotifications: async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                const response = { status: 401, error: "Authentication required", };
                res.status(401).json(response);
                return;
            }
            const query = `SELECT id, title, message, type, is_read, related_entity_type, related_entity_id, created_at FROM notifications WHERE user_id = ? ORDER BY created_at DESC`;
            const [results] = (await database_1.default.execute(query, [userId]));
            res.status(200).json({ status: 200, data: results });
        }
        catch (err) {
            console.error("Error fetching notifications:", err);
            res.status(500).json({ status: 500, error: "Failed to fetch notifications" });
        }
    },
    markAllAsRead: async (req, res) => {
        try {
            const userId = req.user?.id;
            if (!userId) {
                const response = { status: 401, error: "Authentication required", };
                res.status(401).json(response);
                return;
            }
            const query = "UPDATE notifications SET is_read = 1 WHERE user_id = ? AND is_read = 0";
            await database_1.default.execute(query, [userId]);
            res.status(200).json({ status: 200, data: [{ message: "Marked notifications as read" }], });
        }
        catch (err) {
            console.error("Error marking notifications as read:", err);
            res.status(500).json({ status: 500, error: "Failed to mark notifications as read" });
        }
    },
    deleteNotification: async (req, res) => {
        try {
            const userId = req.user?.id;
            const notificationIdParam = req.params.id;
            if (!userId) {
                const response = { status: 401, error: "Authentication required", };
                res.status(401).json(response);
                return;
            }
            if (!notificationIdParam) {
                const response = { status: 400, error: "Notification ID required", };
                res.status(400).json(response);
                return;
            }
            const notificationId = parseInt(notificationIdParam);
            if (isNaN(notificationId)) {
                const response = { status: 400, error: "Invalid notification ID", };
                res.status(400).json(response);
                return;
            }
            const query = "DELETE FROM notifications WHERE id = ? AND user_id = ?";
            const [result] = (await database_1.default.execute(query, [notificationId, userId,]));
            if (result.affectedRows === 0) {
                res.status(404).json({ status: 404, error: "Notification not found" });
                return;
            }
            res.status(200).json({ status: 200, data: [{ message: "Notification deleted successfully" }], });
        }
        catch (err) {
            console.error("Error deleting notification:", err);
            res.status(500).json({ status: 500, error: "Failed to delete notification" });
        }
    },
    deleteOldNotifications: async (daysOld = 30) => {
        try {
            const query = "DELETE FROM notifications WHERE created_at < DATE_SUB(NOW(), INTERVAL ? DAY)";
            const [result] = (await database_1.default.execute(query, [daysOld]));
            console.log(`Deleted ${result.affectedRows} notifications older than ${daysOld} days`);
        }
        catch (err) {
            console.error("Error deleting old notifications:", err);
        }
    },
};
exports.default = notificationController;
//# sourceMappingURL=notificationController.js.map