"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendError = sendError;
exports.sendSuccess = sendSuccess;
exports.processMediaFiles = processMediaFiles;
exports.parseMedia = parseMedia;
exports.validateCreateRecord = validateCreateRecord;
exports.validateUserAuth = validateUserAuth;
exports.buildRecordResponse = buildRecordResponse;
function sendError(res, statusCode, errorMessage, consoleError) {
    if (consoleError) {
        console.error(errorMessage, consoleError);
    }
    const response = {
        status: statusCode,
        error: errorMessage,
    };
    res.status(statusCode).json(response);
}
function sendSuccess(res, statusCode, data) {
    const response = {
        status: statusCode,
        data: Array.isArray(data) ? data : [data],
    };
    res.status(statusCode).json(response);
}
function processMediaFiles(files) {
    const imageFiles = files.filter((file) => file.mimetype.startsWith("image/"));
    const videoFiles = files.filter((file) => file.mimetype.startsWith("video/"));
    return {
        images: imageFiles.map((file) => file.filename),
        videos: videoFiles.map((file) => file.filename),
    };
}
function parseMedia(data) {
    return data.map((item) => ({
        ...item,
        images: item.images ? JSON.parse(item.images) : [],
        videos: item.videos ? JSON.parse(item.videos) : [],
    }));
}
function validateCreateRecord(title, description, latitude, longitude) {
    if (!title || !description) {
        return {
            valid: false,
            error: "Title and description are required fields",
        };
    }
    if (latitude === undefined || longitude === undefined) {
        return {
            valid: false,
            error: "Latitude and longitude are required fields",
        };
    }
    return { valid: true };
}
function validateUserAuth(userId) {
    if (!userId) {
        return {
            valid: false,
            error: "Authentication required",
        };
    }
    return { valid: true };
}
function buildRecordResponse(id, message) {
    return {
        status: 201,
        data: [{ id, message }],
    };
}
//# sourceMappingURL=controllerHelpers.js.map