import { Request, Response } from "express";
import { AuthRequest } from "../types";
export declare const authController: {
    signup: (req: Request, res: Response) => Promise<void>;
    login: (req: Request, res: Response) => Promise<void>;
    getProfile: (req: AuthRequest, res: Response) => Promise<void>;
    updateProfile: (req: AuthRequest, res: Response) => Promise<void>;
    uploadProfilePicture: (req: AuthRequest, res: Response) => Promise<void>;
    getUsers: (req: AuthRequest, res: Response) => Promise<void>;
};
export default authController;
//# sourceMappingURL=authController.d.ts.map