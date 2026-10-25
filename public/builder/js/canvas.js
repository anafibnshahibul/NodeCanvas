import { renderLayersTree }   from "./layersPanel.js";
import { syncPanelToElement } from "./stylePanel.js";
import { pushHistory }        from "./history.js";
import { ELEMENT_DEFINITIONS } from "./elementLibrary.js";

let selectedEl  = null;
let ncIdCounter = 0;

const canvas = document.getElementById("canvas");

export function initCanvas() {
  // Main canvas drop zone (SortableJS)
  Sortable.create(canvas, {
    group: { name: "canvas", put: true, pull: false },
    animation: 150,
    ghostClass: "nc-drop-active",
    filter: ".nc-toolbar,#canvas-empty-hint",
    onAdd:  () => onCanvasChange(),
    onSort: () => onCanvasChange(),
  });

  canvas.addEventListener("click", e => {
    e.stopPropagation();
    const el = e.target.closest("[data-nc-id]");
    if (!el) { clearCanvasSelection(); return; }
    selectElement(el);
  });

  canvas.addEventListener("mouseover", e => {
    const el = e.target.closest("[data-nc-id]");
    document.querySelectorAll(".nc-hover").forEach(n => n.classList.remove("nc-hover"));
    if (el && el !== selectedEl) el.classList.add("nc-hover");
  });
  canvas.addEventListener("mouseleave", () => {
    document.querySelectorAll(".nc-hover").forEach(n => n.classList.remove("nc-hover"));
  });

  document.addEventListener("click", e => {
    if (!canvas.contains(e.target)) clearCanvasSelection();
  });
}

// ── Drop a new element ────────────────────────────────────────────────────
export function dropElement(tag) {
  const def  = ELEMENT_DEFINITIONS[tag] || {};
  const node = document.createElement(def.actualTag || tag);
  const id   = `nc-el-${++ncIdCounter}`;

  node.dataset.ncId  = id;
  node.dataset.ncTag = tag;

  if (def.defaultStyle) Object.assign(node.style, def.defaultStyle);
  if (def.defaultHTML)  node.innerHTML   = def.defaultHTML;
  else if (def.defaultText) node.textContent = def.defaultText;
  if (def.defaultAttrs) Object.entries(def.defaultAttrs).forEach(([k,v]) => node.setAttribute(k, v));

  if (def.isContainer) {
    node.style.minHeight = node.style.minHeight || "60px";
    initNestedSortable(node);
  }

  canvas.appendChild(node);
  document.getElementById("canvas-empty-hint")?.classList.add("hidden");
  selectElement(node);
  onCanvasChange();
}

// ── Nested sortable ───────────────────────────────────────────────────────
function initNestedSortable(el) {
  if (el.dataset.ncContainer) return;
  el.dataset.ncContainer = "1";
  Sortable.create(el, {
    group: { name: "canvas", put: true, pull: true },
    animation: 150,
    ghostClass: "nc-drop-active",
    filter: ".nc-toolbar",
    onAdd:  () => onCanvasChange(),
    onSort: () => onCanvasChange(),
  });
}

// ── Selection ─────────────────────────────────────────────────────────────
export function selectElement(el) {
  if (selectedEl) {
    selectedEl.classList.remove("nc-selected");
    selectedEl.querySelector(":scope > .nc-toolbar")?.remove();
  }
  selectedEl = el;
  el.classList.add("nc-selected");

  // Floating toolbar
  const bar = document.createElement("div");
  bar.className = "nc-toolbar";
  bar.innerHTML = `<span style="opacity:.7;font-family:monospace">&lt;${el.tagName.toLowerCase()}&gt;</span>
    <button class="nc-tb-dup" title="Duplicate" style="margin-left:4px;background:none;border:none;color:#fff;cursor:pointer;font-size:14px">⧉</button>
    <button class="nc-tb-del" title="Delete" style="background:none;border:none;color:#fca5a5;cursor:pointer;font-size:14px">✕</button>`;
  el.appendChild(bar);

  bar.querySelector(".nc-tb-dup").addEventListener("click", e => { e.stopPropagation(); duplicateElement(el); });
  bar.querySelector(".nc-tb-del").addEventListener("click", e => { e.stopPropagation(); pushHistory(); el.remove(); clearCanvasSelection(); onCanvasChange(); });

  // Show properties panel
  document.getElementById("panel-empty").style.display = "none";
  const pp = document.getElementById("panel-properties");
  pp.style.display = "flex";
  pp.classList.remove("hidden");

  syncPanelToElement(el);
  highlightLayer(el.dataset.ncId);
}

export function clearCanvasSelection() {
  if (selectedEl) {
    selectedEl.classList.remove("nc-selected");
    selectedEl.querySelector(":scope > .nc-toolbar")?.remove();
    selectedEl = null;
  }
  document.getElementById("panel-empty").style.display = "";
  const pp = document.getElementById("panel-properties");
  pp.style.display = "none";
  pp.classList.add("hidden");
}

window.deleteSelectedElement = function() {
  const el = getSelectedElement();
  if (!el) return;
  pushHistory();
  el.remove();
  clearCanvasSelection();
  onCanvasChange();
};

export function getSelectedElement() { return selectedEl; }

// ── Public helpers exposed to main.js ─────────────────────────────────────
window._duplicateSelected = () => selectedEl && duplicateElement(selectedEl);
window._duplicateEl       = duplicateElement;
window._wrapInDiv         = wrapInDiv;

function duplicateElement(el) {
  pushHistory();
  const clone = el.cloneNode(true);
  clone.dataset.ncId = `nc-el-${++ncIdCounter}`;
  clone.classList.remove("nc-selected","nc-hover");
  clone.querySelectorAll(".nc-toolbar").forEach(t => t.remove());
  delete clone.dataset.ncContainer;
  el.after(clone);
  const def = ELEMENT_DEFINITIONS[clone.dataset.ncTag];
  if (def?.isContainer) initNestedSortable(clone);
  selectElement(clone);
  onCanvasChange();
}

function wrapInDiv(el) {
  pushHistory();
  const wrapper = document.createElement("div");
  wrapper.dataset.ncId = `nc-el-${++ncIdCounter}`;
  wrapper.style.cssText = "display:block;padding:8px";
  el.parentNode.insertBefore(wrapper, el);
  wrapper.appendChild(el);
  initNestedSortable(wrapper);
  onCanvasChange();
}

// ── Canvas change → update layers + re-init containers ───────────────────
function onCanvasChange() {
  canvas.querySelectorAll("[data-nc-id]").forEach(el => {
    const def = ELEMENT_DEFINITIONS[el.dataset.ncTag];
    if (def?.isContainer && !el.dataset.ncContainer) initNestedSortable(el);
  });
  renderLayersTree(canvas);
  updateHint();
}

function updateHint() {
  const hint = document.getElementById("canvas-empty-hint");
  if (!hint) return;
  hint.classList.toggle("hidden", !!canvas.querySelector("[data-nc-id]"));
}

function highlightLayer(ncId) {
  document.querySelectorAll(".layer-item").forEach(li => {
    li.classList.toggle("selected", li.dataset.ncId === ncId);
  });
}

// ── Serialize / Deserialize ───────────────────────────────────────────────
export function serializeCanvas() {
  return serializeNode(canvas);
}

export function deserializeCanvas(json) {
  canvas.innerHTML = "";
  ncIdCounter = 0;
  document.getElementById("canvas-empty-hint")?.classList.add("hidden");
  if (!json) return;
  const root = Array.isArray(json.children) ? json : { children: [json] };
  root.children.forEach(child => {
    const el = buildNode(child);
    if (el) canvas.appendChild(el);
  });
  onCanvasChange();
}

function serializeNode(node) {
  if (node.nodeType === Node.TEXT_NODE) {
    const t = node.textContent.trim();
    return t ? { type: "text", content: t } : null;
  }
  if (node.nodeType !== Node.ELEMENT_NODE) return null;
  if (node.classList.contains("nc-toolbar") || node.id === "canvas-empty-hint") return null;

  const attrs = {};
  Array.from(node.attributes).forEach(a => {
    if (!["contenteditable"].includes(a.name)) attrs[a.name] = a.value;
  });

  const children = Array.from(node.childNodes).map(serializeNode).filter(Boolean);
  return { tag: node.tagName.toLowerCase(), attrs, children };
}

function buildNode(def) {
  if (!def) return null;
  if (def.type === "text") return document.createTextNode(def.content);
  const el = document.createElement(def.tag);
  Object.entries(def.attrs || {}).forEach(([k,v]) => el.setAttribute(k, v));
  if (!el.dataset.ncId) el.dataset.ncId = `nc-el-${++ncIdCounter}`;
  (def.children || []).forEach(c => { const n = buildNode(c); if(n) el.appendChild(n); });
  const elemDef = ELEMENT_DEFINITIONS[def.tag] || ELEMENT_DEFINITIONS[def.attrs?.["data-nc-tag"]];
  if (elemDef?.isContainer) initNestedSortable(el);
  return el;
}