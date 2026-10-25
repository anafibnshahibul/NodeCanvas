import { Router } from "express";
import { Project } from "../models/Project.js";
import { Submission } from "../models/Submission.js";
import { FULL_STACK_TEMPLATES } from "../utils/templatesData.js";

const router = Router();

// Helper function to convert JSON canvas to HTML
export function renderCanvasToHTML(node) {
  if (!node) return "";
  if (node.type === "text") return node.content || "";
  const tag = node.tag;
  if (!tag) return "";
  const VOID = new Set(["img", "input", "br", "hr", "meta", "link", "area", "base", "col", "source", "track"]);
  const STRIP = new Set(["data-nc-id", "data-nc-tag", "data-nc-container", "data-nc-selected"]);

  const attrs = Object.entries(node.attrs || {})
    .filter(([k]) => !STRIP.has(k))
    .map(([k, v]) => ` ${k}="${String(v).replace(/"/g, '&quot;')}"`)
    .join("");

  if (VOID.has(tag)) return `<${tag}${attrs}/>`;
  const kids = (node.children || []).map(renderCanvasToHTML).join("");
  return `<${tag}${attrs}>${kids}</${tag}>`;
}

// GET /builder/dashboard
router.get("/dashboard", async (req, res, next) => {
  try {
    const projects = await Project.find({}, "name slug thumbnail createdAt updatedAt isPublished")
      .sort({ updatedAt: -1 });

    res.render("builder/dashboard", {
      projects,
      templates: FULL_STACK_TEMPLATES
    });
  } catch (e) {
    next(e);
  }
});

// GET /builder/editor/:projectId
router.get("/editor/:projectId", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("pages");
    if (!project) return res.redirect("/builder/dashboard");

    const firstPage = project.pages?.[0];
    if (firstPage) {
      return res.redirect(`/builder/editor/${req.params.projectId}/${firstPage._id || firstPage.id}`);
    }
    res.render("builder/editor", { project, page: null, pageJson: "null", templates: FULL_STACK_TEMPLATES });
  } catch (e) {
    next(e);
  }
});

// GET /builder/editor/:projectId/:pageId
router.get("/editor/:projectId/:pageId", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("pages");
    if (!project) return res.redirect("/builder/dashboard");

    const targetId = req.params.pageId;
    const page = project.pages?.find(p => (p._id && p._id.toString() === targetId) || (p.id && p.id.toString() === targetId));

    if (!page) {
      return res.redirect(`/builder/editor/${req.params.projectId}`);
    }

    res.render("builder/editor", {
      project,
      page,
      pageJson: JSON.stringify(page.canvas || {}),
      templates: FULL_STACK_TEMPLATES
    });
  } catch (e) {
    next(e);
  }
});

// GET /builder/preview/:projectId — preview homepage
router.get("/preview/:projectId", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("pages");
    if (!project) return res.status(404).send("Project not found");
    const page = project.pages?.find(p => p.isHomepage) || project.pages?.[0];
    res.render("builder/preview", {
      project,
      page,
      renderCanvas: renderCanvasToHTML
    });
  } catch (e) {
    next(e);
  }
});

// GET /builder/preview/:projectId/:pageId — preview specific page
router.get("/preview/:projectId/:pageId", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("pages");
    const page = project?.pages?.find(p => (p._id && p._id.toString() === req.params.pageId) || (p.id && p.id.toString() === req.params.pageId));
    if (!project || !page) return res.status(404).send("Page not found");

    res.render("builder/preview", {
      project,
      page,
      renderCanvas: renderCanvasToHTML
    });
  } catch (e) {
    next(e);
  }
});

// GET /builder/submissions/:projectId — view leads / form submissions
router.get("/submissions/:projectId", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) return res.redirect("/builder/dashboard");

    const submissions = await Submission.find({ projectId: req.params.projectId });
    res.render("builder/submissions", {
      project,
      submissions: submissions.reverse()
    });
  } catch (e) {
    next(e);
  }
});

// GET /builder/templates — HTMX partial for left panel
router.get("/templates", (req, res) => {
  const html = FULL_STACK_TEMPLATES.map(t => `
    <div class="rounded-xl overflow-hidden border border-white/[0.08] hover:border-violet-500/60 bg-[#12141f] cursor-pointer group transition-all"
         onclick="loadTemplate('${t.id}')">
      <div class="aspect-[16/9] bg-[#0a0b0f] overflow-hidden relative">
        <img src="${t.thumbnail}" alt="${t.name}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        <span class="absolute top-2 right-2 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-black/60 text-violet-300 backdrop-blur-sm">${t.badge || t.category}</span>
      </div>
      <div class="p-3">
        <p class="text-xs font-semibold text-white group-hover:text-violet-300 transition-colors">${t.name}</p>
        <p class="text-[11px] text-gray-400 mt-1 line-clamp-2">${t.description}</p>
      </div>
    </div>`).join("");

  res.send(html);
});

export default router;