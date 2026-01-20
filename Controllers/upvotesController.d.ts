import { Response } from "express";
import { AuthRequest } from "../types";
export declare const upvotesController: {
    getUpvotes: (req: AuthRequest, res: Response) => Promise<void>;
    toggleUpvote: (req: AuthRequest, res: Response) => Promise<void>;
};
export default upvotesController;
//# sourceMappingURL=upvotesController.d.ts.map