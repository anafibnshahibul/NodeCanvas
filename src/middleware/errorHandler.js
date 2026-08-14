export function errorHandler(err, req, res, next) {
  const status  = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  console.error(`[${new Date().toISOString()}] ${status} ${req.method} ${req.url} —`, message);
  if (process.env.NODE_ENV !== "production") console.error(err.stack);

  // HTMX requests get an HTML error fragment; REST gets JSON
  const isHTMX = req.headers["hx-request"] === "true";
  if (isHTMX) {
    return res.status(status).send(`
      <div class="flex items-center gap-2 bg-red-900/30 border border-red-500/30 text-red-400 rounded-lg px-4 py-3 text-xs">
        <svg class="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        ${message}
      </div>`);
  }

  res.status(status).json({ error: message });
}