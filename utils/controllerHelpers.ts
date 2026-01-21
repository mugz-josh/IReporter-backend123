import { Response } from "express";
import { ApiResponse } from "../types";

export function sendError(
  res: Response,
  statusCode: number,
  errorMessage: string,
  consoleError?: any
): void {
  if (consoleError) {
    console.error(errorMessage, consoleError);
  }
  const response: ApiResponse = {
    status: statusCode,
    error: errorMessage,
  };
  res.status(statusCode).json(response);
}

export function sendSuccess(
  res: Response,
  statusCode: number,
  data: any
): void {
  const response: ApiResponse = {
    status: statusCode,
    data: Array.isArray(data) ? data : [data],
  };
  res.status(statusCode).json(response);
}

export function processMediaFiles(files: Express.Multer.File[]): {
  images: string[];
  videos: string[];
  audio: string[];
} {
  const imageFiles = files.filter((file) => file.mimetype.startsWith("image/"));
  const videoFiles = files.filter((file) => file.mimetype.startsWith("video/"));
  const audioFiles = files.filter((file) => file.mimetype.startsWith("audio/"));

  return {
    images: imageFiles.map((file) => file.filename),
    videos: videoFiles.map((file) => file.filename),
    audio: audioFiles.map((file) => file.filename),
  };
}

export function parseMedia(data: any[]): any[] {
  return data.map((item) => ({
    ...item,
    images: item.images ? JSON.parse(item.images) : [],
    videos: item.videos ? JSON.parse(item.videos) : [],
    audio: item.audio ? JSON.parse(item.audio) : [],
  }));
}

export function validateCreateRecord(
  title?: string,
  description?: string,
  latitude?: number,
  longitude?: number
): { valid: boolean; error?: string } {
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

export function validateUserAuth(userId: string | number | undefined): {
  valid: boolean;
  error?: string;
} {
  if (!userId) {
    return {
      valid: false,
      error: "Authentication required",
    };
  }
  return { valid: true };
}

export function buildRecordResponse(id: number, message: string): any {
  return {
    status: 201,
    data: [{ id, message }],
  };
}
