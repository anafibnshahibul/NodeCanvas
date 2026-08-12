/**
 * layersPanel.js — Renders and manages the Figma-like layers/DOM tree
 * in the left sidebar. Clicking a layer selects the corresponding
 * canvas element. Tree is rebuilt on every canvas mutation.
 */

import { selectElement } from "./canvas.js";

// ── Re-render the full tree ───────────────────────────────────────────────
export function renderLayersTree(canvas) {
  const container = document.getElementById("layers-tree");
  if (!container) return;
  container.innerHTML = "";

  // Walk only direct children of canvas; recurse into containers
  const children = Array.from(canvas.children).filter(el =>
    el.id !== "canvas-empty-hint" && el.dataset.ncId
  );

  if (children.length === 0) {
    container.innerHTML = `
      <p class="text-xs text-gray-600 text-center mt-8">
        Drop elements onto the canvas<br/>to see the layer tree.
      </p>`;
    return;
  }

  children.forEach(el => {
    container.appendChild(buildLayerItem(el, 0));
  });
}

// ── Recursively build a layer item ───────────────────────────────────────
function buildLayerItem(el, depth) {
  const wrapper = document.createElement("div");

  const hasChildren = Array.from(el.children).some(c =>
    c.dataset.ncId && !c.classList.contains("nc-toolbar")
  );

  const item = document.createElement("div");
  item.className = "layer-item";
  item.dataset.ncId = el.dataset.ncId;
  item.style.paddingLeft = `${(depth * 12) + 8}px`;

  const tag = el.tagName.toLowerCase();
  const icon = getTagIcon(tag);

  item.innerHTML = `
    ${hasChildren ? `
      <button class="layer-expand-btn text-gray-600 hover:text-gray-300 mr-0.5 transition-colors" data-expanded="true" onclick="event.stopPropagation(); toggleLayerExpand(this)">
        <svg class="w-3 h-3 transition-transform" viewBox="0 0 12 12" fill="currentColor">
          <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" fill="none"/>
        </svg>
      </button>` : `<span class="w-3 mr-0.5"></span>`}
    <span class="text-gray-600 mr-1 shrink-0">${icon}</span>
    <span class="font-mono text-[10px] text-violet-400 mr-1">&lt;${tag}&gt;</span>
    <span class="text-gray-400 truncate text-[10px]">${getLayerLabel(el)}</span>
    <div class="ml-auto flex items-center gap-1 opacity-0 group-hover:opacity-100 shrink-0">
      <button class="p-0.5 hover:text-white transition-colors" title="Toggle visibility"
        onclick="event.stopPropagation(); toggleLayerVisibility(this, '${el.dataset.ncId}')">
        <svg class="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
        </svg>
      </button>
    </div>
  `;
  item.classList.add("group");

  // Click → select element on canvas
  item.addEventListener("click", () => {
    const target = document.querySelector(`[data-nc-id="${el.dataset.ncId}"]`);
    if (target) selectElement(target);
  });

  wrapper.appendChild(item);

  // Recursively render children
  if (hasChildren) {
    const childContainer = document.createElement("div");
    childContainer.className = "layer-children";
    Array.from(el.children)
      .filter(c => c.dataset.ncId && !c.classList.contains("nc-toolbar"))
      .forEach(child => {
        childContainer.appendChild(buildLayerItem(child, depth + 1));
      });
    wrapper.appendChild(childContainer);
  }

  return wrapper;
}

// ── Expand/Collapse a layer ───────────────────────────────────────────────
window.toggleLayerExpand = function (btn) {
  const expanded = btn.dataset.expanded === "true";
  btn.dataset.expanded = (!expanded).toString();
  const children = btn.closest("div").nextElementSibling;
  if (children?.classList.contains("layer-children")) {
    children.style.display = expanded ? "none" : "";
  }
  // Rotate chevron icon
  btn.querySelector("svg").style.transform = expanded ? "rotate(-90deg)" : "";
};

// ── Toggle element visibility ─────────────────────────────────────────────
window.toggleLayerVisibility = function (btn, ncId) {
  const el = document.querySelector(`[data-nc-id="${ncId}"]`);
  if (!el) return;
  const hidden = el.style.visibility === "hidden";
  el.style.visibility = hidden ? "" : "hidden";
  btn.style.opacity = hidden ? "1" : "0.3";
};

// ── Highlight layer when element is selected ──────────────────────────────
export function highlightLayer(ncId) {
  document.querySelectorAll(".layer-item").forEach(item => {
    item.classList.toggle("selected", item.dataset.ncId === ncId);
  });
}

// ── Tag → small inline icon ───────────────────────────────────────────────
function getTagIcon(tag) {
  const icons = {
    div:      `<svg class="w-3 h-3 inline" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" stroke-width="1.2"/></svg>`,
    section:  `<svg class="w-3 h-3 inline" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M1 4h10" stroke="currentColor" stroke-width="0.8"/></svg>`,
    p:        `<svg class="w-3 h-3 inline" viewBox="0 0 12 12" fill="none"><path d="M2 3h8M2 6h8M2 9h5" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    img:      `<svg class="w-3 h-3 inline" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" stroke-width="1.2"/><circle cx="4" cy="4" r="1" fill="currentColor"/><path d="M1 8l3-3 3 3 2-2 2 2" stroke="currentColor" stroke-width="0.8"/></svg>`,
    button:   `<svg class="w-3 h-3 inline" viewBox="0 0 12 12" fill="none"><rect x="1" y="3" width="10" height="6" rx="2" stroke="currentColor" stroke-width="1.2"/></svg>`,
    input:    `<svg class="w-3 h-3 inline" viewBox="0 0 12 12" fill="none"><rect x="1" y="3.5" width="10" height="5" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M3 6h1" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`,
    form:     `<svg class="w-3 h-3 inline" viewBox="0 0 12 12" fill="none"><rect x="1" y="1" width="10" height="10" rx="1" stroke="currentColor" stroke-width="1.2"/><path d="M1 4.5h10" stroke="currentColor" stroke-width="0.8"/></svg>`,
    a:        `<svg class="w-3 h-3 inline" viewBox="0 0 12 12" fill="none"><path d="M5 6.5a2.5 2.5 0 003.77.27l1.5-1.5a2.5 2.5 0 00-3.54-3.54l-.86.85" stroke="currentColor" stroke-width="1.2"/><path d="M7 5.5a2.5 2.5 0 00-3.77-.27l-1.5 1.5a2.5 2.5 0 003.54 3.54l.85-.85" stroke="currentColor" stroke-width="1.2"/></svg>`,
    default:  `<svg class="w-3 h-3 inline" viewBox="0 0 12 12" fill="none"><circle cx="6" cy="6" r="4" stroke="currentColor" stroke-width="1.2"/></svg>`,
  };
  const h_tags = ["h1","h2","h3","h4","h5","h6"];
  if (h_tags.includes(tag)) {
    return `<svg class="w-3 h-3 inline" viewBox="0 0 12 12" fill="none"><path d="M2 2v8M2 6h8M10 2v8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round"/></svg>`;
  }
  return icons[tag] || icons.default;
}

// ── Human-readable label from element content ─────────────────────────────
function getLayerLabel(el) {
  // Use ID if set
  if (el.id && !el.id.startsWith("nc-el")) return `#${el.id}`;
  // Use first text content (up to 20 chars)
  const text = el.textContent?.trim().replace(/\s+/g, " ").slice(0, 20);
  if (text) return text;
  // Fall back to src for media
  if (el.src) return el.src.split("/").pop().slice(0, 20);
  return "";
}