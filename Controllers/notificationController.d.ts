import { Response } from "express";
import { AuthRequest } from "../types";
declare const notificationController: {
    createNotificationForUser: (payload: {
        user_id: number;
        title: string;
        message: string;
        type?: string;
        related_entity_type?: string;
        related_entity_id?: number;
    }) => Promise<void>;
    getUserNotifications: (req: AuthRequest, res: Response) => Promise<void>;
    markAllAsRead: (req: AuthRequest, res: Response) => Promise<void>;
    deleteNotification: (req: AuthRequest, res: Response) => Promise<void>;
    deleteOldNotifications: (daysOld?: number) => Promise<void>;
};
export default notificationController;
//# sourceMappingURL=notificationController.d.ts.map