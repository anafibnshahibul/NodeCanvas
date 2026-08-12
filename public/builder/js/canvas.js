/**
 * canvas.js — Core drag-and-drop engine and canvas state manager.
 * Responsibilities:
 *   - Accept drops from the element library sidebar
 *   - Manage the selected element reference
 *   - Serialize canvas state to JSON for saving
 *   - Provide the public API consumed by stylePanel, layersPanel, etc.
 */

import { renderLayersTree }      from "./layersPanel.js";
import { syncPanelToElement }    from "./stylePanel.js";
import { pushHistory }           from "./history.js";
import { ELEMENT_DEFINITIONS }   from "./elementLibrary.js";

// ── Module State ─────────────────────────────────────────────────────────────
let selectedElement = null;   // currently selected DOM node on canvas
let copiedStyle     = null;   // clipboard for "Copy Style"
let ncIdCounter     = 0;      // monotonic ID for nc-id attributes

const canvas = document.getElementById("canvas");

// ── SortableJS: make canvas children reorderable ──────────────────────────
Sortable.create(canvas, {
  group:     { name: "canvas", put: true, pull: false },
  animation: 150,
  ghostClass: "nc-drop-active",
  onAdd:  () => { onCanvasChange(); },
  onSort: () => { onCanvasChange(); },
});

// ── Initialise SortableJS on every nested container ───────────────────────
function initNestedSortable(el) {
  if (el.dataset.ncContainer !== undefined) return; // already initialized
  el.dataset.ncContainer = "1";
  Sortable.create(el, {
    group:     { name: "canvas", put: true, pull: true },
    animation: 150,
    ghostClass: "nc-drop-active",
    onAdd:  () => onCanvasChange(),
    onSort: () => onCanvasChange(),
  });
}

// ── Drop a new element from the sidebar ──────────────────────────────────
export function dropElement(tag, category) {
  const def  = ELEMENT_DEFINITIONS[tag] || {};
  const node = document.createElement(tag);
  const id   = `nc-el-${++ncIdCounter}`;

  node.dataset.ncId  = id;
  node.dataset.ncTag = tag;

  // Apply default styles
  if (def.defaultStyle) {
    Object.assign(node.style, def.defaultStyle);
  }

  // Apply default content/placeholder
  if (def.defaultHTML) {
    node.innerHTML = def.defaultHTML;
  } else if (def.defaultText) {
    node.textContent = def.defaultText;
  }

  // Set default attributes
  if (def.defaultAttrs) {
    Object.entries(def.defaultAttrs).forEach(([k, v]) => node.setAttribute(k, v));
  }

  // Container elements get nested sortable
  if (def.isContainer) {
    node.style.minHeight = node.style.minHeight || "60px";
    initNestedSortable(node);
  }

  canvas.appendChild(node);
  hideEmptyHint();
  selectElement(node);
  onCanvasChange();
}

// ── Element Selection ─────────────────────────────────────────────────────
export function selectElement(el) {
  // Deselect previous
  if (selectedElement) {
    selectedElement.classList.remove("nc-selected");
    selectedElement.querySelector(".nc-toolbar")?.remove();
  }

  selectedElement = el;
  el.classList.add("nc-selected");

  // Inject floating toolbar above selected element
  injectToolbar(el);

  // Show properties panel
  document.getElementById("panel-empty").classList.add("hidden");
  document.getElementById("panel-properties").classList.remove("hidden");

  // Populate the right panel with current element values
  syncPanelToElement(el);

  // Highlight layer in tree
  document.querySelectorAll(".layer-item").forEach(li => {
    li.classList.toggle("selected", li.dataset.ncId === el.dataset.ncId);
  });
}

export function clearCanvasSelection() {
  if (selectedElement) {
    selectedElement.classList.remove("nc-selected");
    selectedElement.querySelector(".nc-toolbar")?.remove();
    selectedElement = null;
  }
  document.getElementById("panel-empty").classList.remove("hidden");
  document.getElementById("panel-properties").classList.add("hidden");
}

export function getSelectedElement() { return selectedElement; }

// ── Click handler (delegated from canvas div) ─────────────────────────────
window.handleCanvasClick = function (e) {
  e.stopPropagation();
  const el = e.target.closest("[data-nc-id]");
  if (!el) { clearCanvasSelection(); return; }
  selectElement(el);
};

// ── Hover highlight ───────────────────────────────────────────────────────
window.handleCanvasHover = function (e) {
  const el = e.target.closest("[data-nc-id]");
  document.querySelectorAll(".nc-hover").forEach(n => n.classList.remove("nc-hover"));
  if (el && el !== selectedElement) el.classList.add("nc-hover");
};

window.clearHoverHighlight = function () {
  document.querySelectorAll(".nc-hover").forEach(n => n.classList.remove("nc-hover"));
};

// ── Floating element toolbar ───────────────────────────────────────────────
function injectToolbar(el) {
  el.style.position = el.style.position || "relative";
  const bar = document.createElement("div");
  bar.className = "nc-toolbar";
  bar.innerHTML = `
    <span class="font-mono opacity-70">&lt;${el.tagName.toLowerCase()}&gt;</span>
    <button onclick="event.stopPropagation(); duplicateElement()" title="Duplicate" class="ml-1 hover:opacity-70">⧉</button>
    <button onclick="event.stopPropagation(); deleteSelectedElement()" title="Delete" class="hover:text-red-300">✕</button>
  `;
  el.appendChild(bar);
}

// ── Context Menu Actions ──────────────────────────────────────────────────
window.contextAction = function (action) {
  const el = window.__ctxElement || selectedElement;
  if (!el) return;
  switch (action) {
    case "duplicate":   duplicateElement(el); break;
    case "copy-style":  copiedStyle = el.getAttribute("style"); break;
    case "paste-style": if (copiedStyle) { el.setAttribute("style", copiedStyle); syncPanelToElement(el); } break;
    case "wrap-div":    wrapInDiv(el); break;
    case "move-up":     el.previousElementSibling?.before(el); onCanvasChange(); break;
    case "move-down":   el.nextElementSibling?.after(el); onCanvasChange(); break;
    case "delete":      el.remove(); clearCanvasSelection(); onCanvasChange(); break;
  }
};

function duplicateElement(el = selectedElement) {
  if (!el) return;
  pushHistory();
  const clone = el.cloneNode(true);
  clone.dataset.ncId = `nc-el-${++ncIdCounter}`;
  clone.classList.remove("nc-selected");
  clone.querySelectorAll(".nc-toolbar").forEach(t => t.remove());
  el.after(clone);
  if (clone.dataset.ncContainer !== undefined) initNestedSortable(clone);
  selectElement(clone);
  onCanvasChange();
}

function wrapInDiv(el) {
  pushHistory();
  const wrapper = document.createElement("div");
  wrapper.dataset.ncId = `nc-el-${++ncIdCounter}`;
  wrapper.style.cssText = "display:block; padding: 8px;";
  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);
  initNestedSortable(wrapper);
  onCanvasChange();
}

window.duplicateElement     = duplicateElement;
window.deleteSelectedElement = function () {
  if (!selectedElement) return;
  pushHistory();
  selectedElement.remove();
  clearCanvasSelection();
  onCanvasChange();
};

// ── Canvas Change: update layers + serialize state ────────────────────────
function onCanvasChange() {
  // Re-init any new containers that dropped in
  canvas.querySelectorAll("[data-nc-id]").forEach(el => {
    const def = ELEMENT_DEFINITIONS[el.tagName.toLowerCase()];
    if (def?.isContainer && el.dataset.ncContainer === undefined) {
      initNestedSortable(el);
    }
  });

  renderLayersTree(canvas);
  serializeToHiddenInput();
  updateEmptyHintVisibility();
}

// ── Serialise canvas DOM → JSON → hidden input (for HTMX save) ───────────
function serializeToHiddenInput() {
  const json = serializeNode(canvas);
  document.getElementById("canvas-state").value = JSON.stringify(json);
}

function serializeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent.trim();
    return t ? { type: "text", content: t } : null;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return null;

  // Skip builder UI chrome
  if (node.classList.contains("nc-toolbar") ||
      node.id === "canvas-empty-hint") return null;

  const attrs = {};
  Array.from(node.attributes).forEach(a => {
    if (!["contenteditable"].includes(a.name)) attrs[a.name] = a.value;
  });

  const children = Array.from(node.childNodes)
    .map(serializeNode)
    .filter(Boolean);

  return { tag: node.tagName.toLowerCase(), attrs, children };
}

// ── Deserialise JSON → DOM (for project load) ─────────────────────────────
export function deserializeCanvas(json) {
  canvas.innerHTML = "";
  ncIdCounter = 0;
  if (!json?.children) return;
  json.children.forEach(child => {
    const el = buildNode(child);
    if (el) canvas.appendChild(el);
  });
  hideEmptyHint();
  onCanvasChange();
}

function buildNode(def) {
  if (def.type === "text") return document.createTextNode(def.content);
  const el = document.createElement(def.tag);
  Object.entries(def.attrs || {}).forEach(([k, v]) => el.setAttribute(k, v));
  if (!el.dataset.ncId) el.dataset.ncId = `nc-el-${++ncIdCounter}`;
  (def.children || []).forEach(child => {
    const childEl = buildNode(child);
    if (childEl) el.appendChild(childEl);
  });
  const elemDef = ELEMENT_DEFINITIONS[def.tag];
  if (elemDef?.isContainer) initNestedSortable(el);
  return el;
}

// ── Utility ───────────────────────────────────────────────────────────────
function hideEmptyHint() {
  document.getElementById("canvas-empty-hint")?.classList.add("hidden");
}
function updateEmptyHintVisibility() {
  const hint = document.getElementById("canvas-empty-hint");
  if (!hint) return;
  const hasElements = canvas.querySelector("[data-nc-id]");
  hint.classList.toggle("hidden", !!hasElements);
}