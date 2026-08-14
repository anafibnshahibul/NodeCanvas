const MAX = 50;
const past   = [];
const future = [];

export function initHistory() {
  window._historyUndo = undo;
  window._historyRedo = redo;
  updateBtns();
}

export function pushHistory() {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;
  const snap = canvas.innerHTML
    .replace(/<div class="nc-toolbar"[^>]*>[\s\S]*?<\/div>/g, "")
    .trim();
  past.push(snap);
  if (past.length > MAX) past.shift();
  future.length = 0;
  updateBtns();
}

function restore(html) {
  const canvas = document.getElementById("canvas");
  if (!canvas) return;
  canvas.innerHTML = html;
  // Re-attach SortableJS on containers
  canvas.querySelectorAll("[data-nc-container]").forEach(el => {
    Sortable.create(el, {
      group: { name: "canvas", put: true, pull: true },
      animation: 150,
      ghostClass: "nc-drop-active",
      filter: ".nc-toolbar",
    });
  });
  import("./layersPanel.js").then(m => m.renderLayersTree(canvas));
  updateBtns();
}

function undo() {
  if (!past.length) return;
  const canvas = document.getElementById("canvas");
  future.push(canvas.innerHTML.replace(/<div class="nc-toolbar"[^>]*>[\s\S]*?<\/div>/g,"").trim());
  restore(past.pop());
}

function redo() {
  if (!future.length) return;
  const canvas = document.getElementById("canvas");
  past.push(canvas.innerHTML.replace(/<div class="nc-toolbar"[^>]*>[\s\S]*?<\/div>/g,"").trim());
  restore(future.pop());
}

function updateBtns() {
  const u = document.getElementById("btn-undo");
  const r = document.getElementById("btn-redo");
  if (u) u.disabled = past.length   === 0;
  if (r) r.disabled = future.length === 0;
}