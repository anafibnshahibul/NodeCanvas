/**
 * requestLogger.js — Concise dev logger with method color coding.
 */
const COLORS = { GET: "\x1b[32m", POST: "\x1b[34m", PUT: "\x1b[33m", DELETE: "\x1b[31m", PATCH: "\x1b[35m" };
const RESET  = "\x1b[0m";

export function requestLogger(req, res, next) {
  if (process.env.NODE_ENV === "production") return next();
  const start  = Date.now();
  const color  = COLORS[req.method] || "\x1b[37m";
  res.on("finish", () => {
    const ms = Date.now() - start;
    const sc = res.statusCode >= 400 ? "\x1b[31m" : "\x1b[32m";
    console.log(`${color}${req.method}${RESET} ${req.url} ${sc}${res.statusCode}${RESET} ${ms}ms`);
  });
  next();
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * rateLimiter.js — Per-IP rate limiting via express-rate-limit.
 */
import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs:         15 * 60 * 1000, // 15 minutes
  max:              500,             // requests per window per IP
  standardHeaders:  true,
  legacyHeaders:    false,
  skip: (req) => req.path.startsWith("/uploads"), // skip static file serving
  handler: (req, res) => {
    const isHTMX = req.headers["hx-request"] === "true";
    if (isHTMX) return res.status(429).send("<p class='text-red-400 text-xs'>Too many requests. Please slow down.</p>");
    res.status(429).json({ error: "Too many requests" });
  },
});