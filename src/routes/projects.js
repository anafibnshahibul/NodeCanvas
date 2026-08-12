/**
 * projects.js — REST API routes for project CRUD.
 * All routes are prefixed /api/projects by server.js
 */

import { Router }          from "express";
import { Project }         from "../models/Project.js";
import { exportProject }   from "../services/exportService.js";
import path                from "path";

const router = Router();

// GET /api/projects — list all projects
router.get("/", async (req, res, next) => {
  try {
    const projects = await Project.find({}, "name slug thumbnail createdAt updatedAt isPublished")
      .sort({ updatedAt: -1 })
      .limit(100);
    res.json({ projects });
  } catch (e) { next(e); }
});

// POST /api/projects — create new project
router.post("/", async (req, res, next) => {
  try {
    const project = new Project({ name: req.body.name || "Untitled Project" });
    await project.save();
    res.status(201).json({ project });
  } catch (e) { next(e); }
});

// GET /api/projects/:id — load one project
router.get("/:id", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.json({ project });
  } catch (e) { next(e); }
});

// PUT /api/projects/:id/save — autosave canvas state
router.post("/:id/save", async (req, res, next) => {
  try {
    const { canvasState } = req.body;
    const canvas = JSON.parse(canvasState || "{}");
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { canvas, updatedAt: new Date() },
      { new: true }
    );
    if (!project) return res.status(404).json({ error: "Not found" });
    // HTMX-friendly response: just a toast fragment
    res.send(`<div class="text-xs text-green-400 flex items-center gap-1">
      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
      Saved
    </div>`);
  } catch (e) { next(e); }
});

// POST /api/projects/:id/rename
router.post("/:id/rename", async (req, res, next) => {
  try {
    await Project.findByIdAndUpdate(req.params.id, { name: req.body.name });
    res.status(204).end();
  } catch (e) { next(e); }
});

// PUT /api/projects/:id/meta — save SEO/code injection meta
router.put("/:id/meta", async (req, res, next) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { meta: req.body },
      { new: true }
    );
    res.json({ project });
  } catch (e) { next(e); }
});

// DELETE /api/projects/:id
router.delete("/:id", async (req, res, next) => {
  try {
    await Project.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (e) { next(e); }
});

export default router;