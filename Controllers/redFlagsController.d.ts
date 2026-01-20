import { Response } from "express";
import { AuthRequest } from "../types";
export declare const redFlagsController: {
    getAllRedFlags: (req: AuthRequest, res: Response) => Promise<void>;
    getRedFlag: (req: AuthRequest, res: Response) => Promise<void>;
    createRedFlag: (req: AuthRequest, res: Response) => Promise<void>;
    addMedia: (req: AuthRequest, res: Response) => Promise<void>;
    updateLocation: (req: AuthRequest, res: Response) => Promise<void>;
    updateComment: (req: AuthRequest, res: Response) => Promise<void>;
    deleteRedFlag: (req: AuthRequest, res: Response) => Promise<void>;
    updateStatus: (req: AuthRequest, res: Response) => Promise<void>;
    updateRedFlag: (req: AuthRequest, res: Response) => Promise<void>;
};
export default redFlagsController;
//# sourceMappingURL=redFlagsController.d.ts.map