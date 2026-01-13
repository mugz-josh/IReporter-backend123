import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";

import routes from "./routes/routes";
import notificationController from "./Controllers/notificationController";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(
  cors({
    origin: "http://localhost:3001",
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Serve static files from the React app build directory
app.use(express.static(path.join(__dirname, "../frontend/dist")));

app.use("/api/v1", routes);

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    status: 200,
    data: [{ message: "iReporter API is running successfully" }],
  });
});

// Catch all handler: send back React's index.html file for any non-API routes
app.get("*", (req: Request, res: Response) => {
  res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
});

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 500,
    error: "Something went wrong!",
  });
});

app.listen(PORT, () => {
  console.log(`iReporter server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV}`);
});
