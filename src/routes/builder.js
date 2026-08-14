import { Router } from "express";
import { Project } from "../models/Project.js";

const router = Router();

// GET /builder/dashboard
router.get("/dashboard", async (req, res, next) => {
  try {
    const projects = await Project.find({}, "name slug thumbnail createdAt updatedAt isPublished")
      .sort({ updatedAt: -1 });
    res.render("builder/dashboard", { projects });
  } catch (e) { next(e); }
});

// GET /builder/editor/:projectId — open first page by default
router.get("/editor/:projectId", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("pages");
    if (!project) return res.redirect("/builder/dashboard");
    // Redirect to first page editor
    const firstPage = project.pages?.[0];
    if (firstPage) return res.redirect(`/builder/editor/${req.params.projectId}/${firstPage._id}`);
    res.render("builder/editor", { project, page: null, pageJson: "null" });
  } catch (e) { next(e); }
});

// GET /builder/editor/:projectId/:pageId — edit a specific page
router.get("/editor/:projectId/:pageId", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("pages");
    if (!project) return res.redirect("/builder/dashboard");
    const page = project.pages?.find(p => p._id.toString() === req.params.pageId);
    if (!page) return res.redirect(`/builder/editor/${req.params.projectId}`);
    res.render("builder/editor", {
      project,
      page,
      pageJson: JSON.stringify(page.canvas || {}),
    });
  } catch (e) { next(e); }
});

// GET /builder/preview/:projectId — preview all pages
router.get("/preview/:projectId", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("pages");
    if (!project) return res.status(404).send("Project not found");
    const page = project.pages?.[0];
    res.render("builder/preview", { project, page });
  } catch (e) { next(e); }
});

// GET /builder/preview/:projectId/:pageId
router.get("/preview/:projectId/:pageId", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.projectId).populate("pages");
    const page = project?.pages?.find(p => p._id.toString() === req.params.pageId);
    if (!project || !page) return res.status(404).send("Page not found");
    res.render("builder/preview", { project, page });
  } catch (e) { next(e); }
});

// GET /builder/templates — HTMX partial
router.get("/templates", (req, res) => {
  const templates = [
    { id: "blank",     name: "Blank Canvas",  category: "Basic",    gradient: "from-gray-800 to-gray-900" },
    { id: "landing",   name: "Landing Page",  category: "Marketing",gradient: "from-violet-900 to-indigo-900" },
    { id: "portfolio", name: "Portfolio",     category: "Personal", gradient: "from-emerald-900 to-teal-900" },
    { id: "blog",      name: "Blog",          category: "Content",  gradient: "from-orange-900 to-red-900" },
    { id: "saas",      name: "SaaS Hero",     category: "Product",  gradient: "from-blue-900 to-cyan-900" },
    { id: "contact",   name: "Contact Page",  category: "Forms",    gradient: "from-pink-900 to-rose-900" },
  ];
  const html = templates.map(t => `
    <div class="rounded-lg overflow-hidden border border-white/[0.06] hover:border-violet-500/40
                cursor-pointer group transition-all"
         onclick="loadTemplate('${t.id}')">
      <div class="aspect-[4/3] bg-gradient-to-br ${t.gradient}"></div>
      <div class="p-2">
        <p class="text-xs font-medium text-gray-300 group-hover:text-white transition-colors">${t.name}</p>
        <p class="text-[10px] text-gray-600">${t.category}</p>
      </div>
    </div>`).join("");
  res.send(html);
});

export default router;