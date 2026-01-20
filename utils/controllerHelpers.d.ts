import { Response } from "express";
export declare function sendError(res: Response, statusCode: number, errorMessage: string, consoleError?: any): void;
export declare function sendSuccess(res: Response, statusCode: number, data: any): void;
export declare function processMediaFiles(files: Express.Multer.File[]): {
    images: string[];
    videos: string[];
};
export declare function parseMedia(data: any[]): any[];
export declare function validateCreateRecord(title?: string, description?: string, latitude?: number, longitude?: number): {
    valid: boolean;
    error?: string;
};
export declare function validateUserAuth(userId: string | number | undefined): {
    valid: boolean;
    error?: string;
};
export declare function buildRecordResponse(id: number, message: string): any;
//# sourceMappingURL=controllerHelpers.d.ts.map