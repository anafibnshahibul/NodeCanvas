import path   from "path";
import fs     from "fs/promises";
import sharp  from "sharp";
import { v4 as uuidv4 } from "uuid";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "./uploads";
const ORIGINALS  = path.join(UPLOAD_DIR, "originals");
const THUMBS     = path.join(UPLOAD_DIR, "thumbs");
const WEBP_DIR   = path.join(UPLOAD_DIR, "webp");

await fs.mkdir(ORIGINALS, { recursive: true });
await fs.mkdir(THUMBS,    { recursive: true });
await fs.mkdir(WEBP_DIR,  { recursive: true });

const IMAGE_EXTS = new Set([".jpg",".jpeg",".png",".gif",".webp",".avif",".tiff",".bmp"]);
const MAX_WIDTH  = 2560;
const THUMB_W    = 400;
const WEBP_Q     = 82;
const THUMB_Q    = 72;

export async function processUpload(file) {
  const ext     = path.extname(file.originalname).toLowerCase();
  const isImage = IMAGE_EXTS.has(ext);
  const id      = uuidv4();

  const record = {
    id,
    originalName: file.originalname,
    mimeType:     file.mimetype,
    url:          null,
    thumbUrl:     null,
    webpUrl:      null,
    width:        null,
    height:       null,
    sizeOriginal: file.size,
    sizeWebp:     null,
    isImage,
    ext,
    createdAt: new Date().toISOString(),
  };

  if (isImage) {
    try {
      const meta    = await sharp(file.path).metadata();
      record.width  = meta.width;
      record.height = meta.height;

      // ── WebP conversion (main file) ──────────────────────────────────
      const webpFilename = `${id}.webp`;
      const webpPath     = path.join(WEBP_DIR, webpFilename);
      await sharp(file.path)
        .resize(meta.width > MAX_WIDTH ? MAX_WIDTH : null, null, { withoutEnlargement: true })
        .webp({ quality: WEBP_Q, effort: 4 })
        .toFile(webpPath);

      const webpStat    = await fs.stat(webpPath);
      record.sizeWebp   = webpStat.size;
      record.url        = `/uploads/webp/${webpFilename}`;
      record.webpUrl    = record.url;

      // ── Thumbnail ────────────────────────────────────────────────────
      const thumbFilename = `${id}-thumb.webp`;
      const thumbPath     = path.join(THUMBS, thumbFilename);
      await sharp(file.path)
        .resize(THUMB_W, null, { withoutEnlargement: true })
        .webp({ quality: THUMB_Q })
        .toFile(thumbPath);
      record.thumbUrl = `/uploads/thumbs/${thumbFilename}`;

      // Keep original as fallback
      const origFilename = `${id}${ext}`;
      await fs.rename(file.path, path.join(ORIGINALS, origFilename));

      const saved = ((file.size - webpStat.size) / file.size * 100).toFixed(1);
      console.log(`  ✓ Converted ${file.originalname} → WebP, saved ${saved}%`);
    } catch (err) {
      console.warn("  ⚠ Image processing failed:", err.message);
      // Fallback: just store original
      const origFilename = `${id}${ext}`;
      await fs.rename(file.path, path.join(ORIGINALS, origFilename));
      record.url = `/uploads/originals/${origFilename}`;
    }
  } else {
    // Non-image file: store as-is
    const origFilename = `${id}${ext}`;
    await fs.rename(file.path, path.join(ORIGINALS, origFilename));
    record.url = `/uploads/originals/${origFilename}`;
  }

  return record;
}

export async function listMedia(page = 1, perPage = 40) {
  // Scan WebP folder first (converted images), then originals for non-images
  const webpFiles  = await fs.readdir(WEBP_DIR).catch(() => []);
  const origFiles  = await fs.readdir(ORIGINALS).catch(() => []);

  const allItems = [
    ...webpFiles.filter(f => !f.includes("-thumb")).map(f => ({
      id: f.replace(".webp",""),
      url: `/uploads/webp/${f}`,
      thumbUrl: null,
      isImage: true, ext: ".webp",
    })),
    ...origFiles.filter(f => {
      const e = path.extname(f).toLowerCase();
      return !IMAGE_EXTS.has(e); // only non-images from originals
    }).map(f => ({
      id: path.basename(f, path.extname(f)),
      url: `/uploads/originals/${f}`,
      thumbUrl: null,
      isImage: false,
      ext: path.extname(f).toLowerCase(),
    })),
  ].reverse();

  // Attach thumbs
  const thumbFiles = await fs.readdir(THUMBS).catch(() => []);
  const thumbMap   = new Map(thumbFiles.map(f => [f.replace("-thumb.webp",""), `/uploads/thumbs/${f}`]));

  const paged = allItems.slice((page-1)*perPage, page*perPage).map(item => ({
    ...item,
    thumbUrl: thumbMap.get(item.id) || item.url,
  }));

  return { items: paged, total: allItems.length, page, perPage };
}

export async function deleteMedia(id) {
  await Promise.all([
    fs.rm(path.join(WEBP_DIR,   `${id}.webp`)).catch(()=>{}),
    fs.rm(path.join(THUMBS,     `${id}-thumb.webp`)).catch(()=>{}),
    ...[".jpg",".jpeg",".png",".gif",".webp",".avif"].map(e =>
      fs.rm(path.join(ORIGINALS, `${id}${e}`)).catch(()=>{})
    ),
  ]);
  return { id, deleted: true };
}