import { Router } from "express";
import { Project } from "../models/Project.js";
import { Page }    from "../models/Page.js";

const router = Router({ mergeParams: true }); // gives access to :id from parent

// ── GET /api/projects/:id/pages — list all pages (ordered) ───────────────
router.get("/", async (req, res, next) => {
  try {
    const pages = await Page.find({ projectId: req.params.id })
      .sort({ order: 1 })
      .select("name slug order isHomepage meta.title createdAt updatedAt");
    res.json({ pages });
  } catch (e) { next(e); }
});

// ── POST /api/projects/:id/pages — create a new page ─────────────────────
router.post("/", async (req, res, next) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ error: "Project not found" });

    const pageCount = await Page.countDocuments({ projectId: req.params.id });
    const isFirst   = pageCount === 0;

    const page = new Page({
      projectId:  req.params.id,
      name:       req.body.name  || "Untitled Page",
      slug:       req.body.slug  || (isFirst ? "index" : `page-${Date.now()}`),
      order:      pageCount,
      isHomepage: isFirst,
      canvas:     req.body.canvas || {},
    });
    await page.save();

    // Push ref into project
    project.pages.push(page._id);
    await project.save();

    // Return an HTMX-renderable page tab item
    const isHTMX = req.headers["hx-request"] === "true";
    if (isHTMX) {
      return res.send(renderPageTab(page, req.params.id, true));
    }
    res.status(201).json({ page });
  } catch (e) { next(e); }
});

// ── GET /api/projects/:id/pages/:pageId — load one page ──────────────────
router.get("/:pageId", async (req, res, next) => {
  try {
    const page = await Page.findOne({ _id: req.params.pageId, projectId: req.params.id });
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json({ page });
  } catch (e) { next(e); }
});

// ── POST /api/projects/:id/pages/:pageId/save — autosave canvas ──────────
router.post("/:pageId/save", async (req, res, next) => {
  try {
    const { canvasState } = req.body;
    const canvas = JSON.parse(canvasState || "{}");
    const page = await Page.findOneAndUpdate(
      { _id: req.params.pageId, projectId: req.params.id },
      { canvas },
      { new: true }
    );
    if (!page) return res.status(404).json({ error: "Page not found" });

    const isHTMX = req.headers["hx-request"] === "true";
    if (isHTMX) {
      return res.send(`<span class="text-xs text-green-400 flex items-center gap-1">
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
        </svg>Saved</span>`);
    }
    res.json({ page });
  } catch (e) { next(e); }
});

// ── PUT /api/projects/:id/pages/:pageId — update name/slug/meta ──────────
router.put("/:pageId", async (req, res, next) => {
  try {
    const allowed = ["name", "slug", "order", "isHomepage", "meta"];
    const updates = Object.fromEntries(
      Object.entries(req.body).filter(([k]) => allowed.includes(k))
    );
    const page = await Page.findOneAndUpdate(
      { _id: req.params.pageId, projectId: req.params.id },
      updates,
      { new: true }
    );
    if (!page) return res.status(404).json({ error: "Page not found" });
    res.json({ page });
  } catch (e) { next(e); }
});

// ── DELETE /api/projects/:id/pages/:pageId ────────────────────────────────
router.delete("/:pageId", async (req, res, next) => {
  try {
    const pageCount = await Page.countDocuments({ projectId: req.params.id });
    if (pageCount <= 1) return res.status(400).json({ error: "Cannot delete the only page" });

    await Page.findOneAndDelete({ _id: req.params.pageId, projectId: req.params.id });

    // Remove from project.pages array
    await Project.findByIdAndUpdate(req.params.id, {
      $pull: { pages: req.params.pageId }
    });

    // If deleted page was homepage, promote the next one
    const remaining = await Page.find({ projectId: req.params.id }).sort({ order: 1 });
    if (remaining.length && !remaining.some(p => p.isHomepage)) {
      remaining[0].isHomepage = true;
      await remaining[0].save();
    }

    res.status(204).end();
  } catch (e) { next(e); }
});

// ── POST /api/projects/:id/pages/reorder — update page order ─────────────
router.post("/reorder", async (req, res, next) => {
  try {
    // req.body.order = [{ pageId, order }, ...]
    await Promise.all(
      req.body.order.map(({ pageId, order }) =>
        Page.findOneAndUpdate({ _id: pageId, projectId: req.params.id }, { order })
      )
    );
    res.status(204).end();
  } catch (e) { next(e); }
});

// ── Helper: render a page tab as HTMX HTML ───────────────────────────────
function renderPageTab(page, projectId, isActive = false) {
  return `
  <div class="page-tab-item flex items-center gap-1 group" data-page-id="${page._id}">
    <a href="/builder/editor/${projectId}/${page._id}"
       class="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all
              ${isActive ? "bg-violet-600/30 text-violet-300" : "text-gray-400 hover:text-white hover:bg-white/5"}">
      ${page.isHomepage
        ? `<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>`
        : `<svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>`
      }
      ${page.name}
    </a>
    <button
      onclick="renamePage('${page._id}', '${page.name}')"
      class="opacity-0 group-hover:opacity-100 p-0.5 text-gray-600 hover:text-gray-300 transition-all" title="Rename">
      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
    </button>
    <button
      hx-delete="/api/projects/${projectId}/pages/${page._id}"
      hx-confirm="Delete this page? This cannot be undone."
      hx-target="closest .page-tab-item"
      hx-swap="outerHTML swap:0.2s"
      class="opacity-0 group-hover:opacity-100 p-0.5 text-gray-600 hover:text-red-400 transition-all" title="Delete page">
      <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/></svg>
    </button>
  </div>`;
}

export { renderPageTab };
export default router;