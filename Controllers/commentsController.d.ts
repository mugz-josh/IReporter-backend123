import { Response } from "express";
import { AuthRequest } from "../types";
export declare const commentsController: {
    getComments: (req: AuthRequest, res: Response) => Promise<void>;
    addComment: (req: AuthRequest, res: Response) => Promise<void>;
    deleteComment: (req: AuthRequest, res: Response) => Promise<void>;
};
export default commentsController;
//# sourceMappingURL=commentsController.d.ts.map