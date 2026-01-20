import { Response, NextFunction } from "express";
import { AuthRequest } from "../types";
export declare const auth: {
    verifyToken: (req: AuthRequest, res: Response, next: NextFunction) => void;
    isAdmin: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
    checkRecordOwnership: (table: string) => (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
};
export default auth;
//# sourceMappingURL=auth.d.ts.map