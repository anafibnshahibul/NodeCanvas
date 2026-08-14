import { Router } from "express";
import { Project } from "../models/Project.js";
import { Page }    from "../models/Page.js";

const router = Router();

// GET /api/projects
router.get("/", async (req, res, next) => {
  try {
    const projects = await Project.find({}, "name slug thumbnail createdAt updatedAt isPublished")
      .sort({ updatedAt: -1 }).limit(100);
    res.json({ projects });
  } catch (e) { next(e); }
});

// POST /api/projects — create project + auto-create first "Home" page
router.post("/", async (req, res, next) => {
  try {
    const project = new Project({ name: req.body.name || "Untitled Project" });
    await project.save();

    // Auto-create the homepage
    const homePage = new Page({
      projectId:  project._id,
      name:       "Home",
      slug:       "index",
      order:      0,
      isHomepage: true,
      canvas:     {},
    });
    await homePage.save();
    project.pages.push(homePage._id);
    await project.save();

    res.status(201).json({ project, homePage });
  } catch (e) { next(e); }
});

// GET /api/projects/:id
router.get("/:id", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id).populate("pages");
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ project });
  } catch (e) { next(e); }
});

// POST /api/projects/:id/rename
router.post("/:id/rename", async (req, res, next) => {
  try {
    await Project.findByIdAndUpdate(req.params.id, { name: req.body.name });
    res.status(204).end();
  } catch (e) { next(e); }
});

// PUT /api/projects/:id/globalMeta
router.put("/:id/globalMeta", async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id, { globalMeta: req.body }, { new: true }
    );
    res.json({ project });
  } catch (e) { next(e); }
});

// DELETE /api/projects/:id — deletes project + all its pages
router.delete("/:id", async (req, res, next) => {
  try {
    await Page.deleteMany({ projectId: req.params.id });
    await Project.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;