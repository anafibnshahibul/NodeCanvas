import { Router } from "express";
import path from "path";
import { Project } from "../models/Project.js";
import { Page } from "../models/Page.js";
import { exportProject } from "../services/exportService.js";

const router = Router();

const ALLOWED_FORMATS = new Set(["static", "wordpress", "json"]);

router.post("/:projectId/:format", async (req, res, next) => {
  try {
    const { projectId, format } = req.params;

    // Security check: validate format
    if (!ALLOWED_FORMATS.has(format)) {
      return res.status(400).json({ error: "Invalid export format. Allowed formats: static, wordpress, json" });
    }

    const cleanProjectId = path.basename(projectId);
    const project = await Project.findById(cleanProjectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const pages = await Page.find({ projectId: cleanProjectId }).sort({ order: 1 });
    if (!pages.length) return res.status(400).json({ error: "No pages found in project" });

    const zipPath = await exportProject(
      project.toObject ? project.toObject() : project,
      pages.map(p => (p.toObject ? p.toObject() : p)),
      format
    );
    const filename = path.basename(zipPath);

    if (req.headers["hx-request"] === "true") {
      return res.send(`
        <div style="display:flex;align-items:center;gap:12px;background:#1e2130;border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:12px 16px;box-shadow:0 20px 40px rgba(0,0,0,.4)">
          <svg style="width:20px;height:20px;color:#34d399;flex-shrink:0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <div>
            <p style="font-size:12px;font-weight:600;color:#fff;margin:0 0 2px">Export ready — ${pages.length} page(s)</p>
            <a href="/exports/${filename}" download style="font-size:11px;color:#a78bfa;text-decoration:none;font-weight:600">⬇ Download ${filename}</a>
          </div>
          <button onclick="this.closest('div').remove()" style="margin-left:auto;background:none;border:none;color:#6b7280;cursor:pointer;font-size:16px">✕</button>
        </div>`);
    }

    res.json({ downloadUrl: `/exports/${filename}`, filename });
  } catch (e) {
    next(e);
  }
});

export default router;