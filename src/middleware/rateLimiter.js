import rateLimit from "express-rate-limit";

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path.startsWith("/uploads") || req.path.startsWith("/exports"),
  handler: (req, res) => {
    const isHTMX = req.headers["hx-request"] === "true";
    if (isHTMX) return res.status(429).send(`<p class="text-red-400 text-xs">Too many requests.</p>`);
    res.status(429).json({ error: "Too many requests" });
  },
});