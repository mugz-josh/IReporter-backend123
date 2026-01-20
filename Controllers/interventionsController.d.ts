import { Response } from "express";
import { AuthRequest } from "../types";
export declare const interventionsController: {
    getAllInterventions: (req: AuthRequest, res: Response) => Promise<void>;
    getIntervention: (req: AuthRequest, res: Response) => Promise<void>;
    createIntervention: (req: AuthRequest, res: Response) => Promise<void>;
    addMedia: (req: AuthRequest, res: Response) => Promise<void>;
    updateLocation: (req: AuthRequest, res: Response) => Promise<void>;
    updateComment: (req: AuthRequest, res: Response) => Promise<void>;
    deleteIntervention: (req: AuthRequest, res: Response) => Promise<void>;
    updateStatus: (req: AuthRequest, res: Response) => Promise<void>;
    updateIntervention: (req: AuthRequest, res: Response) => Promise<void>;
};
export default interventionsController;
//# sourceMappingURL=interventionsController.d.ts.map