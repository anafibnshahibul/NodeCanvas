/**
 * NodeCanvas — Enterprise Website Builder
 * server.js — Main entry point
 */

import express        from "express";
import cors           from "cors";
import helmet         from "helmet";
import compression    from "compression";
import path           from "path";
import { fileURLToPath } from "url";
import { createServer }  from "http";
import { WebSocketServer } from "ws";
import dotenv         from "dotenv";

import projectRoutes  from "./src/routes/projects.js";
import mediaRoutes    from "./src/routes/media.js";
import exportRoutes   from "./src/routes/export.js";
import builderRoutes  from "./src/routes/builder.js";
import templateRoutes from "./src/routes/templates.js";
import pageRoutes     from "./src/routes/pages.js";

import { errorHandler }   from "./src/middleware/errorHandler.js";
import { requestLogger }  from "./src/middleware/requestLogger.js";
import { rateLimiter }    from "./src/middleware/rateLimiter.js";
import { connectDB }      from "./src/utils/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app        = express();
const httpServer = createServer(app);
const PORT       = process.env.PORT || 3000;

// ── WebSocket: real-time collaboration ───────────────────────────────────
const wss = new WebSocketServer({ server: httpServer });
const projectRooms = new Map();

wss.on("connection", (ws, req) => {
  const projectId = new URL(req.url, "http://localhost").searchParams.get("project");
  if (!projectId) return ws.close();
  if (!projectRooms.has(projectId)) projectRooms.set(projectId, new Set());
  projectRooms.get(projectId).add(ws);

  ws.on("message", (data) => {
    projectRooms.get(projectId)?.forEach(client => {
      if (client !== ws && client.readyState === 1) client.send(data);
    });
  });
  ws.on("close", () => projectRooms.get(projectId)?.delete(ws));
});

// ── Middleware ────────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      ["'self'", "'unsafe-inline'", "'unsafe-eval'", "cdn.jsdelivr.net", "unpkg.com"],
      scriptSrcAttr:  ["'unsafe-inline'"],   // allows onclick= attributes
      styleSrc:       ["'self'", "'unsafe-inline'", "fonts.googleapis.com", "cdn.jsdelivr.net", "unpkg.com"],
      fontSrc:        ["'self'", "fonts.gstatic.com"],
      imgSrc:         ["'self'", "data:", "blob:", "*"],
      connectSrc:     ["'self'", "ws:", "wss:", "*"],
    },
  },
}));
app.use(cors());
app.use(compression());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(requestLogger);
app.use(rateLimiter);

// ── Static files ──────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads",  express.static(path.join(__dirname, "uploads")));
app.use("/exports",  express.static(path.join(__dirname, "exports")));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

// ── Routes ────────────────────────────────────────────────────────────────
app.use("/api/projects",            projectRoutes);
app.use("/api/projects/:id/pages",  pageRoutes);
app.use("/api/media",               mediaRoutes);
app.use("/api/export",              exportRoutes);
app.use("/api/templates",           templateRoutes);
app.use("/builder",                 builderRoutes);

app.get("/", (req, res) => res.redirect("/builder/dashboard"));

app.use(errorHandler);

// ── Boot ──────────────────────────────────────────────────────────────────
await connectDB();
httpServer.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════╗
  ║     NodeCanvas Builder v1.0          ║
  ║     http://localhost:${PORT}           ║
  ╚══════════════════════════════════════╝`);
});
