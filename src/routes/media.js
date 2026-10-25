import { Router } from "express";
import multer from "multer";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { processUpload, listMedia, deleteMedia } from "../services/mediaService.js";

const router = Router();

const ALLOWED_EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".gif", ".svg", ".avif", ".mp4", ".webm"]);
const ALLOWED_MIMES = new Set([
  "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "image/avif",
  "video/mp4", "video/webm"
]);

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "./uploads/tmp"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: (parseInt(process.env.MAX_FILE_SIZE_MB) || 20) * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (!ALLOWED_EXTS.has(ext) || !ALLOWED_MIMES.has(file.mimetype)) {
      return cb(new Error("Security violation: Only safe image and video formats are allowed."));
    }
    cb(null, true);
  }
});

import fs from "fs/promises";
await fs.mkdir("./uploads/tmp", { recursive: true });

// POST /api/media/upload
router.post("/upload", upload.array("files", 20), async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).send("<p class='text-red-400 text-xs'>No files were selected for upload.</p>");
    }
    const results = await Promise.all(req.files.map(processUpload));
    const html = results.map(item => renderMediaItem(item)).join("");
    res.send(html);
  } catch (e) {
    next(e);
  }
});

// GET /api/media/list — returns grid HTML for HTMX
router.get("/list", async (req, res, next) => {
  try {
    const { items } = await listMedia(parseInt(req.query.page) || 1);
    const html = items.map(item => renderMediaItem(item)).join("") ||
      `<p class="col-span-4 text-xs text-gray-500 text-center py-8">No media uploaded yet.</p>`;
    res.send(html);
  } catch (e) {
    next(e);
  }
});

// DELETE /api/media/:id
router.delete("/:id", async (req, res, next) => {
  try {
    // Security: sanitize ID to prevent directory traversal
    const safeId = path.basename(req.params.id);
    await deleteMedia(safeId);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

function renderMediaItem(item) {
  return `
  <div class="group relative aspect-square rounded-lg overflow-hidden bg-[#12141f] border border-white/[0.06] cursor-pointer hover:border-violet-500/50 transition-all"
    onclick="selectMedia('${item.url}', '${item.filename || item.id}')">
    ${item.isImage
      ? `<img src="${item.thumbUrl || item.url}" alt="${item.filename || 'media'}"
             class="w-full h-full object-cover" loading="lazy" />`
      : `<div class="flex flex-col items-center justify-center h-full">
           <svg class="w-8 h-8 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
             <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
           </svg>
           <span class="text-[10px] text-gray-500 mt-1">${item.ext ? item.ext.toUpperCase() : 'FILE'}</span>
         </div>`
    }
    <div class="absolute inset-0 bg-violet-600/0 group-hover:bg-violet-600/20 transition-all flex items-center justify-center">
      <span class="opacity-0 group-hover:opacity-100 text-white text-xs font-medium bg-black/50 px-2 py-0.5 rounded transition-all">Select</span>
    </div>
    <button onclick="event.stopPropagation(); deleteMedia('${item.id}')"
      class="absolute top-1 right-1 opacity-0 group-hover:opacity-100 p-1 bg-red-600 rounded text-white transition-all"
      hx-delete="/api/media/${item.id}" hx-target="closest div" hx-swap="outerHTML swap:0.2s">
      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  </div>`;
}

export default router;