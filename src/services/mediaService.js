/**
 * mediaService.js — Handles file uploads and image optimization via Sharp.
 * Uploaded originals are stored in /uploads/originals/
 * Optimized thumbnails are generated in /uploads/thumbs/
 */

import path   from "path";
import fs     from "fs/promises";
import sharp  from "sharp";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const ORIGINALS  = path.join(UPLOAD_DIR, "originals");
const THUMBS     = path.join(UPLOAD_DIR, "thumbs");
const MAX_W      = 2560; // max output width
const THUMB_W    = 400;

// Ensure directories exist on startup
await fs.mkdir(ORIGINALS, { recursive: true });
await fs.mkdir(THUMBS,    { recursive: true });

// ── Upload and optimize a single file ────────────────────────────────────
export async function processUpload(file) {
  const ext      = path.extname(file.originalname).toLowerCase();
  const isImage  = [".jpg",".jpeg",".png",".gif",".webp",".avif",".svg"].includes(ext);
  const id       = uuidv4();
  const filename = `${id}${ext}`;

  const originalPath = path.join(ORIGINALS, filename);
  await fs.rename(file.path, originalPath);

  const record = {
    id,
    filename,
    originalName: file.originalname,
    mimeType:     file.mimetype,
    size:         file.size,
    url:          `/uploads/originals/${filename}`,
    thumbUrl:     null,
    width:        null,
    height:       null,
    createdAt:    new Date().toISOString(),
  };

  if (isImage && ext !== ".svg") {
    try {
      const meta    = await sharp(originalPath).metadata();
      record.width  = meta.width;
      record.height = meta.height;

      // Resize if too large (original)
      if (meta.width > MAX_W) {
        await sharp(originalPath)
          .resize(MAX_W, null, { withoutEnlargement: true })
          .webp({ quality: 85 })
          .toFile(originalPath.replace(ext, ".webp"));
      }

      // Generate thumbnail
      const thumbFilename = `${id}-thumb.webp`;
      const thumbPath     = path.join(THUMBS, thumbFilename);
      await sharp(originalPath)
        .resize(THUMB_W, null, { withoutEnlargement: true })
        .webp({ quality: 75 })
        .toFile(thumbPath);

      record.thumbUrl = `/uploads/thumbs/${thumbFilename}`;
    } catch (err) {
      console.warn("Image optimization failed:", err.message);
    }
  }

  return record;
}

// ── List all uploaded media ───────────────────────────────────────────────
export async function listMedia(page = 1, perPage = 40) {
  const files = await fs.readdir(ORIGINALS);
  const sorted = files.reverse(); // newest first
  const paged  = sorted.slice((page - 1) * perPage, page * perPage);

  const items = await Promise.all(
    paged.map(async (filename) => {
      const ext      = path.extname(filename).toLowerCase();
      const id       = filename.replace(ext, "");
      const isImage  = [".jpg",".jpeg",".png",".gif",".webp",".avif"].includes(ext);
      const thumbFile = `${id}-thumb.webp`;
      const thumbExists = await fs.access(path.join(THUMBS, thumbFile)).then(() => true).catch(() => false);

      return {
        id,
        filename,
        url:      `/uploads/originals/${filename}`,
        thumbUrl: thumbExists ? `/uploads/thumbs/${thumbFile}` : `/uploads/originals/${filename}`,
        isImage,
        ext,
      };
    })
  );

  return {
    items,
    total: files.length,
    page,
    perPage,
    totalPages: Math.ceil(files.length / perPage),
  };
}

// ── Delete a media item ───────────────────────────────────────────────────
export async function deleteMedia(id) {
  const files = await fs.readdir(ORIGINALS);
  const match = files.find(f => f.startsWith(id));
  if (!match) throw new Error("File not found");

  const ext = path.extname(match);
  await fs.rm(path.join(ORIGINALS, match)).catch(() => {});
  await fs.rm(path.join(THUMBS, `${id}-thumb.webp`)).catch(() => {});
  return { id, deleted: true };
}