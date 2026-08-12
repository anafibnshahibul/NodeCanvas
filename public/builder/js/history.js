/**
 * history.js — Undo/Redo stack via canvas HTML snapshots.
 * Keeps up to MAX_STACK snapshots of the canvas innerHTML.
 * Exposes window.history_undo / history_redo for toolbar buttons.
 */

const MAX_STACK = 50;
const stack = [];   // past states
const future = [];  // undone states (for redo)

// ── Snapshot the current canvas state ─────────────────────────────────────
export function pushHistory() {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;

  // Clone current state
  const snapshot = canvas.cloneNode(true);
  // Remove builder chrome before saving
  snapshot.querySelectorAll(".nc-toolbar, .nc-selected, .nc-hover").forEach(el => {
    el.classList?.remove("nc-selected", "nc-hover");
    if (el.classList?.contains("nc-toolbar")) el.remove();
  });

  stack.push(snapshot.innerHTML);
  if (stack.length > MAX_STACK) stack.shift();

  // A new action invalidates the redo queue
  future.length = 0;
  updateButtonStates();
}

// ── Restore a snapshot to canvas ──────────────────────────────────────────
function restoreSnapshot(html) {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;
  canvas.innerHTML = html;

  // Re-attach SortableJS on all restored containers
  canvas.querySelectorAll("[data-nc-id]").forEach(el => {
    if (el.dataset.ncContainer !== undefined) {
      Sortable.create(el, {
        group: { name: "canvas", put: true, pull: true },
        animation: 150,
        ghostClass: "nc-drop-active",
        onAdd:  () => import("./canvas.js").then(m => m.onCanvasChange?.()),
        onSort: () => import("./canvas.js").then(m => m.onCanvasChange?.()),
      });
    }
  });

  // Re-render layers tree
  import("./layersPanel.js").then(m => m.renderLayersTree(canvas));
  updateButtonStates();
}

// ── Undo ──────────────────────────────────────────────────────────────────
window.history_undo = function () {
  if (stack.length === 0) return;
  const canvas = document.getElementById("canvas");

  // Push current state to future before restoring
  const current = canvas.cloneNode(true);
  current.querySelectorAll(".nc-toolbar").forEach(t => t.remove());
  future.push(current.innerHTML);

  restoreSnapshot(stack.pop());
};

// ── Redo ──────────────────────────────────────────────────────────────────
window.history_redo = function () {
  if (future.length === 0) return;
  const canvas = document.getElementById("canvas");

  // Save current to stack
  const current = canvas.cloneNode(true);
  current.querySelectorAll(".nc-toolbar").forEach(t => t.remove());
  stack.push(current.innerHTML);

  restoreSnapshot(future.pop());
};

// ── Update toolbar button disabled states ─────────────────────────────────
function updateButtonStates() {
  const undoBtn = document.getElementById("btn-undo");
  const redoBtn = document.getElementById("btn-redo");
  if (undoBtn) undoBtn.disabled = stack.length === 0;
  if (redoBtn) redoBtn.disabled = future.length === 0;
}