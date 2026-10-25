/**
 * NodeCanvas — Enterprise Drag-and-Drop Website Builder
 * server.js — Main production server entry point
 * Configured for custom port localhost:9080 with JSON database engine
 */

import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import dotenv from "dotenv";

import projectRoutes  from "./src/routes/projects.js";
import mediaRoutes    from "./src/routes/media.js";
import exportRoutes   from "./src/routes/export.js";
import builderRoutes  from "./src/routes/builder.js";
import templateRoutes from "./src/routes/templates.js";
import pageRoutes     from "./src/routes/pages.js";
import formRoutes     from "./src/routes/forms.js";

import { errorHandler }   from "./src/middleware/errorHandler.js";
import { requestLogger }  from "./src/middleware/requestLogger.js";
import { rateLimiter }    from "./src/middleware/rateLimiter.js";
import { connectDB }      from "./src/utils/db.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app        = express();
const httpServer = createServer(app);
const PORT       = parseInt(process.env.PORT, 10) || 9080;

// ── WebSocket: real-time multi-client collaboration ──────────────────────
const wss = new WebSocketServer({ server: httpServer });
const projectRooms = new Map();

wss.on("connection", (ws, req) => {
  try {
    const host = req.headers.host || `localhost:${PORT}`;
    const url = new URL(req.url, `http://${host}`);
    const projectId = url.searchParams.get("project");

    if (!projectId) {
      return ws.close();
    }

    if (!projectRooms.has(projectId)) {
      projectRooms.set(projectId, new Set());
    }
    projectRooms.get(projectId).add(ws);

    ws.on("message", (data) => {
      const room = projectRooms.get(projectId);
      if (room) {
        room.forEach(client => {
          if (client !== ws && client.readyState === 1) {
            client.send(data);
          }
        });
      }
    });

    ws.on("close", () => {
      const room = projectRooms.get(projectId);
      if (room) {
        room.delete(ws);
        if (room.size === 0) projectRooms.delete(projectId);
      }
    });
  } catch (err) {
    ws.close();
  }
});

// ── Security Middleware (Helmet + Fine-grained CSP) ───────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc:     ["'self'"],
      scriptSrc:      [
        "'self'",
        "'unsafe-inline'",
        "'unsafe-eval'",
        "cdn.jsdelivr.net",
        "unpkg.com",
        "cdn.tailwindcss.com"
      ],
      scriptSrcAttr:  ["'unsafe-inline'"],
      styleSrc:       [
        "'self'",
        "'unsafe-inline'",
        "fonts.googleapis.com",
        "cdn.jsdelivr.net",
        "unpkg.com",
        "cdn.tailwindcss.com"
      ],
      fontSrc:        ["'self'", "fonts.gstatic.com", "data:"],
      imgSrc:         ["'self'", "data:", "blob:", "https:", "*"],
      connectSrc:     ["'self'", "ws:", "wss:", `ws://localhost:${PORT}`, `http://localhost:${PORT}`, "*"],
      frameSrc:       ["'self'", "https:", "*"],
      frameAncestors: ["'self'"], // Protect against external iframe clickjacking while allowing builder preview
      objectSrc:      ["'none'"],
      upgradeInsecureRequests: null, // Allow local development over HTTP without forced upgrade
    },
  },
  frameguard: { action: "sameorigin" },
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const allowedOrigins = (process.env.ALLOWED_ORIGINS || `http://localhost:${PORT}`).split(",");
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.includes("localhost")) {
      callback(null, true);
    } else {
      callback(null, true); // Permissive for local development builder previews
    }
  },
  credentials: true
}));

app.use(compression());
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ extended: true, limit: "25mb" }));
app.use(requestLogger);
app.use(rateLimiter);

// ── Static assets ────────────────────────────────────────────────────────
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/exports", express.static(path.join(__dirname, "exports")));

// ── View Engine ──────────────────────────────────────────────────────────
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src", "views"));

// ── API & Builder Routes ──────────────────────────────────────────────────
app.use("/api/projects",            projectRoutes);
app.use("/api/projects/:id/pages",  pageRoutes);
app.use("/api/media",               mediaRoutes);
app.use("/api/export",              exportRoutes);
app.use("/api/templates",           templateRoutes);
app.use("/api/forms",               formRoutes);
app.use("/api/contact",             formRoutes);
app.use("/builder",                 builderRoutes);

// Root redirect to dashboard
app.get("/", (req, res) => res.redirect("/builder/dashboard"));

// Centralized error handling
app.use(errorHandler);

// ── Boot Database & HTTP Server ──────────────────────────────────────────
await connectDB();

httpServer.listen(PORT, () => {
  console.log(`
  ╔════════════════════════════════════════════════════╗
  ║     🚀 NodeCanvas Builder v1.0 [PRODUCTION]        ║
  ║     Port: ${PORT}                                     ║
  ║     URL:  http://localhost:${PORT}                    ║
  ║     DB:   JSON Atomic File Storage (Zero-Mongo)   ║
  ╚════════════════════════════════════════════════════╝`);
});
