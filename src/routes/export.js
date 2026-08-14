import { Router }  from "express";
import path        from "path";
import { Project } from "../models/Project.js";
import { Page }    from "../models/Page.js";
import { exportProject } from "../services/exportService.js";

const router = Router();

router.post("/:projectId/:format", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const pages = await Page.find({ projectId: req.params.projectId }).sort({ order: 1 });
    if (!pages.length) return res.status(400).json({ error: "Project has no pages" });

    const zipPath = await exportProject(project.toObject(), pages.map(p => p.toObject()), req.params.format);
    const filename = path.basename(zipPath);

    const isHTMX = req.headers["hx-request"] === "true";
    if (isHTMX) {
      return res.send(`
        <div class="flex items-center gap-3 bg-[#1e2130] border border-white/10 rounded-xl px-4 py-3 shadow-2xl"
             style="animation:slideInUp 0.3s ease both">
          <svg class="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <div>
            <p class="text-xs font-semibold text-white">Export ready — ${pages.length} page(s)</p>
            <a href="/exports/${filename}" download
               class="text-[10px] text-violet-400 hover:text-violet-300">⬇ Download ${filename}</a>
          </div>
          <button onclick="this.closest('div').remove()" class="ml-2 text-gray-500 hover:text-white">✕</button>
        </div>`);
    }
    res.json({ downloadUrl: `/exports/${filename}`, filename });
  } catch (e) { next(e); }
});

export default router;