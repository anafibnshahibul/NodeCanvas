/**
 * export.js — /api/export routes
 */
import { Router } from "express";
import path       from "path";
import { Project }        from "../models/Project.js";
import { exportProject }  from "../services/exportService.js";

const router = Router();

// POST /api/export/:id/static
// POST /api/export/:id/wordpress
// POST /api/export/:id/json
router.post("/:id/:format", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const zipPath = await exportProject(project.toObject(), req.params.format);
    const filename = path.basename(zipPath);

    // HTMX: return a toast with a download link
    res.send(`
      <div class="flex items-center gap-3 bg-[#1e2130] border border-white/10 rounded-xl px-4 py-3 shadow-2xl animate-[slideInUp_0.3s_ease_both]">
        <svg class="w-5 h-5 text-green-400 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>
        <div>
          <p class="text-xs font-semibold text-white">Export Ready</p>
          <a href="/exports/${filename}" download class="text-[10px] text-violet-400 hover:text-violet-300">
            Download ${filename}
          </a>
        </div>
        <button onclick="this.closest('div').remove()" class="ml-2 text-gray-500 hover:text-white">
          <svg class="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
      </div>`);
  } catch (e) { next(e); }
});

export default router;

// ─────────────────────────────────────────────────────────────────────────────

/**
 * builder.js — /builder/* routes (HTMX-rendered HTML partials)
 */
import { Router as R2 } from "express";
export const builderRouter = R2();

// GET /builder/dashboard — project list page
builderRouter.get("/dashboard", async (req, res, next) => {
  try {
    const projects = await Project.find({}, "name slug thumbnail createdAt updatedAt")
      .sort({ updatedAt: -1 });
    res.render("builder/dashboard", { projects });
  } catch (e) { next(e); }
});

// GET /builder/editor/:id — main builder page
builderRouter.get("/editor/:id", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.redirect("/builder/dashboard");
    res.render("builder/editor", { project });
  } catch (e) { next(e); }
});

// GET /builder/preview/:id — live preview (no builder chrome)
builderRouter.get("/preview/:id", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).send("Project not found");
    res.render("builder/preview", { project });
  } catch (e) { next(e); }
});

// GET /builder/templates — HTMX partial: template grid
builderRouter.get("/templates", async (req, res) => {
  const templates = getBuiltinTemplates();
  const html = templates.map(t => `
    <div class="rounded-lg overflow-hidden border border-white/[0.06] hover:border-violet-500/40 cursor-pointer group transition-all"
      onclick="loadTemplate('${t.id}')">
      <div class="aspect-[4/3] bg-gradient-to-br ${t.gradient}"></div>
      <div class="p-2">
        <p class="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">${t.name}</p>
        <p class="text-[10px] text-gray-600">${t.category}</p>
      </div>
    </div>`).join("");
  res.send(html || `<p class="text-xs text-gray-600 text-center py-4">No templates yet.</p>`);
});

function getBuiltinTemplates() {
  return [
    { id: "blank",      name: "Blank Canvas",   category: "Basic",    gradient: "from-gray-800 to-gray-900" },
    { id: "landing",    name: "Landing Page",    category: "Marketing",gradient: "from-violet-900 to-indigo-900" },
    { id: "portfolio",  name: "Portfolio",       category: "Personal", gradient: "from-emerald-900 to-teal-900" },
    { id: "blog",       name: "Blog",            category: "Content",  gradient: "from-orange-900 to-red-900" },
    { id: "saas",       name: "SaaS Hero",       category: "Product",  gradient: "from-blue-900 to-cyan-900" },
    { id: "contact",    name: "Contact Page",    category: "Forms",    gradient: "from-pink-900 to-rose-900" },
  ];
}

// ─────────────────────────────────────────────────────────────────────────────

/**
 * templates.js — /api/templates routes
 */
import { Router as R3 } from "express";
export const templateRouter = R3();

// GET /api/templates/:id/canvas — returns canvas JSON for a template
templateRouter.get("/:id/canvas", (req, res) => {
  const templates = {
    blank: { tag: "div", attrs: {}, children: [] },
    landing: {
      tag: "div", attrs: { "data-nc-id": "root" },
      children: [
        { tag: "section", attrs: { style: "padding:80px 40px;text-align:center;background:linear-gradient(135deg,#667eea,#764ba2);color:white;" }, children: [
          { tag: "h1",   attrs: { style: "font-size:3rem;font-weight:700;margin-bottom:16px" }, children: [{ type: "text", content: "Build Something Amazing" }] },
          { tag: "p",    attrs: { style: "font-size:1.25rem;opacity:0.9;max-width:560px;margin:0 auto 32px" }, children: [{ type: "text", content: "Your tagline goes here. Describe what makes your product special." }] },
          { tag: "button", attrs: { style: "padding:14px 32px;background:white;color:#7c3aed;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer" }, children: [{ type: "text", content: "Get Started" }] },
        ]},
      ],
    },
  };
  const canvas = templates[req.params.id] || templates.blank;
  res.json({ canvas });
});