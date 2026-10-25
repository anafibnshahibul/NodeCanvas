import { Router } from "express";
import { Project } from "../models/Project.js";
import { Page } from "../models/Page.js";
import { FULL_STACK_TEMPLATES } from "../utils/templatesData.js";

const router = Router();

// GET /api/projects — list projects
router.get("/", async (req, res, next) => {
  try {
    const projects = await Project.find({}, "name slug thumbnail createdAt updatedAt isPublished")
      .sort({ updatedAt: -1 })
      .limit(100);
    res.json({ projects });
  } catch (e) {
    next(e);
  }
});

// POST /api/projects — create project (optionally with template)
router.post("/", async (req, res, next) => {
  try {
    const rawName = (req.body.name || "Untitled Project").trim();
    // Security: basic sanitization
    const name = rawName.replace(/<[^>]*>?/gm, "").slice(0, 100) || "Untitled Project";
    const templateId = req.body.templateId;
    const selectedTemplate = FULL_STACK_TEMPLATES.find(t => t.id === templateId);

    const project = new Project({
      name,
      thumbnail: selectedTemplate?.thumbnail || "",
      globalMeta: {
        lang: "en",
        favicon: "",
        globalCSS: "",
        globalJS: "",
        customHTML: ""
      }
    });
    await project.save();

    // Auto-create homepage
    const homePage = new Page({
      projectId: project._id,
      name: "Home",
      slug: "index",
      order: 0,
      isHomepage: true,
      canvas: selectedTemplate?.canvas || {},
      meta: {
        title: `${name} — Home`,
        description: selectedTemplate?.description || ""
      }
    });
    await homePage.save();
    project.pages.push(homePage._id);

    // If template has contact page, add it too
    if (selectedTemplate && selectedTemplate.id !== "blank" && selectedTemplate.id !== "contact") {
      const contactTmpl = FULL_STACK_TEMPLATES.find(t => t.id === "contact");
      if (contactTmpl) {
        const contactPage = new Page({
          projectId: project._id,
          name: "Contact",
          slug: "contact",
          order: 1,
          isHomepage: false,
          canvas: contactTmpl.canvas,
          meta: {
            title: `Contact — ${name}`,
            description: "Get in touch with us"
          }
        });
        await contactPage.save();
        project.pages.push(contactPage._id);
      }
    }

    await project.save();

    res.status(201).json({ project, homePage });
  } catch (e) {
    next(e);
  }
});

// GET /api/projects/:id
router.get("/:id", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate("pages");
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ project });
  } catch (e) {
    next(e);
  }
});

// POST /api/projects/:id/rename
router.post("/:id/rename", async (req, res, next) => {
  try {
    const cleanName = (req.body.name || "").trim().replace(/<[^>]*>?/gm, "").slice(0, 100);
    if (!cleanName) return res.status(400).json({ error: "Invalid name" });
    await Project.findByIdAndUpdate(req.params.id, { name: cleanName });
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

// POST /api/projects/:id/duplicate — clone whole project with all pages
router.post("/:id/duplicate", async (req, res, next) => {
  try {
    const original = await Project.findById(req.params.id).populate("pages");
    if (!original) return res.status(404).json({ error: "Project not found" });

    const newProject = new Project({
      name: `${original.name} (Copy)`,
      thumbnail: original.thumbnail,
      globalMeta: original.globalMeta
    });
    await newProject.save();

    const newPageIds = [];
    if (Array.isArray(original.pages)) {
      for (const page of original.pages) {
        const clonedPage = new Page({
          projectId: newProject._id,
          name: page.name,
          slug: page.slug,
          order: page.order,
          isHomepage: page.isHomepage,
          canvas: page.canvas,
          meta: page.meta
        });
        await clonedPage.save();
        newPageIds.push(clonedPage._id);
      }
    }

    newProject.pages = newPageIds;
    await newProject.save();

    res.status(201).json({ project: newProject });
  } catch (e) {
    next(e);
  }
});

// PUT /api/projects/:id/globalMeta
router.put("/:id/globalMeta", async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { globalMeta: req.body },
      { new: true }
    );
    res.json({ project });
  } catch (e) {
    next(e);
  }
});

// DELETE /api/projects/:id
router.delete("/:id", async (req, res, next) => {
  try {
    await Page.deleteMany({ projectId: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});

export default router;