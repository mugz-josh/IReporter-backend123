import express, { Request } from "express";

export interface User {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
  is_admin: boolean;
  profile_picture?: string;
  created_at: Date;
  updated_at: Date;
}

// Database interfaces (matches your actual schema)
export interface RedFlagDB {
  id: number;
  user_id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  status: "draft" | "under-investigation" | "rejected" | "resolved";
  images: string | null; // JSON string or null in database
  videos: string | null; // JSON string or null in database
  created_at: Date;
  updated_at: Date;
}

// API response interfaces (with parsed arrays)
export interface RedFlag {
  id: number;
  user_id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  status: "draft" | "under-investigation" | "rejected" | "resolved";
  images: string[]; // Array of image file paths
  videos: string[]; // Array of video file paths
  created_at: Date;
  updated_at: Date;
}

export interface InterventionDB extends RowDataPacket {
  id: number;
  user_id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  status: "draft" | "under-investigation" | "rejected" | "resolved";
  images: string | null; // JSON string or null in database
  videos: string | null; // JSON string or null in database
  created_at: Date;
  updated_at: Date;
}

export interface Intervention {
  id: number;
  user_id: number;
  title: string;
  description: string;
  latitude: number;
  longitude: number;
  status: "draft" | "under-investigation" | "rejected" | "resolved";
  images: string[]; // Array of image file paths
  videos: string[]; // Array of video file paths
  created_at: Date;
  updated_at: Date;
}

// Extended interfaces for joined queries
export interface RedFlagWithUser extends RedFlagDB {
  first_name: string;
  last_name: string;
  email: string;
}

export interface InterventionWithUser extends InterventionDB {
  first_name: string;
  last_name: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: {
    id: number;
    email: string;
    isAdmin?: boolean;
  };
}

export interface SignupData {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  phone?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface CreateRecordData {
  title: string;
  description: string;
  latitude: number;
  longitude: number;
}

export interface UpdateLocationData {
  latitude: number;
  longitude: number;
}

export interface UpdateCommentData {
  description: string;
}

export interface UpdateStatusData {
  status: "under-investigation" | "rejected" | "resolved";
}

export interface ApiResponse<T = any> {
  status: number;
  data?: T[];
  error?: string;
  message?: string;
}

export interface AuthResponse {
  token: string;
  user: Omit<User, "password">;
}

export interface RecordResponse {
  id: number;
  message: string;
}

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  destination: string;
  filename: string;
  path: string;
  size: number;
}
