/**
 * NodeCanvas - Enterprise Drag-and-Drop Website Builder
 * Main Server Entry Point
 * Stack: Node.js + Express + HTMX + Tailwind CSS
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";

// Route imports
import projectRoutes from "./src/routes/projects.js";
import mediaRoutes from "./src/routes/media.js";
import exportRoutes from "./src/routes/export.js";
import builderRoutes from "./src/routes/builder.js";
import templateRoutes from "./src/routes/templates.js";

// Middleware imports
import { errorHandler } from "./src/middleware/errorHandler.js";
import { requestLogger } from "./src/middleware/requestLogger.js";
import { rateLimiter } from "./src/middleware/rateLimiter.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// ─── WebSocket Server for Real-time Collaboration ────────────────────────────
const wss = new WebSocketServer({ server: httpServer });
const projectRooms = new Map(); // projectId -> Set<ws>

wss.on("connection", (ws, req) => {
  const projectId = new URL(req.url, "http://localhost").searchParams.get("project");
  if (!projectId) return ws.close();

  if (!projectRooms.has(projectId)) projectRooms.set(projectId, new Set());
  projectRooms.get(projectId).add(ws);

  ws.on("message", (data) => {
    // Broadcast canvas mutations to all collaborators in the same project room
    const room = projectRooms.get(projectId);
    if (!room) return;
    room.forEach((client) => {
      if (client !== ws && client.readyState === 1) {
        client.send(data);
      }
    });
  });

  ws.on("close", () => {
    projectRooms.get(projectId)?.delete(ws);
  });
});

// ─── Core Middleware ──────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "cdn.jsdelivr.net", "unpkg.com"],
      styleSrc: ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdn.jsdelivr.net"],
      fontSrc: ["'self'", "fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "blob:", "*"],
      connectSrc: ["'self'", "ws:", "wss:"],
    },
  },
}));

app.use(cors({ origin: process.env.ALLOWED_ORIGINS?.split(",") || "*" }));
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestLogger);
app.use(rateLimiter);

// ─── Static Files ─────────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Set EJS as template engine for server-rendered HTMX partials
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

// ─── API Routes ───────────────────────────────────────────────────────────────
app.use("/api/projects", projectRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/export", exportRoutes);
app.use("/api/templates", templateRoutes);

// ─── HTMX Partial Routes (server-rendered HTML fragments) ────────────────────
app.use("/builder", builderRoutes);

// ─── Root: Redirect to Builder Dashboard ────────────────────────────────────
app.get("/", (req, res) => res.redirect("/builder/dashboard"));

// ─── Error Handler (must be last) ────────────────────────────────────────────
app.use(errorHandler);

httpServer.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║     NodeCanvas Builder v1.0          ║
  ║     http://localhost:${PORT}           ║
  ║     WebSocket: ws://localhost:${PORT}  ║
  ╚══════════════════════════════════════╝
  `);
});

export { app, wss };