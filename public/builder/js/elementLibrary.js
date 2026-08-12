/**
 * elementLibrary.js — Defines every droppable element and renders
 * the sidebar palette. Each definition drives:
 *   - What HTML tag is created
 *   - Default styles / content / attributes
 *   - Which sidebar group it appears in
 *   - Its icon in the palette
 */

import { dropElement } from "./canvas.js";

// ── Element Definitions ───────────────────────────────────────────────────
export const ELEMENT_DEFINITIONS = {

  // ── Layout ───────────────────────────────────────────────────────────────
  div: {
    label: "Container", group: "layout", isContainer: true,
    icon: `<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
    defaultStyle: { display: "block", minHeight: "80px", padding: "16px" },
  },
  section: {
    label: "Section", group: "layout", isContainer: true,
    icon: `<path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    defaultStyle: { display: "block", padding: "40px 20px", minHeight: "120px" },
  },
  header: {
    label: "Header", group: "layout", isContainer: true,
    icon: `<path d="M3 4h18v4H3zM3 10h18" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
    defaultStyle: { display: "flex", alignItems: "center", padding: "16px 24px", backgroundColor: "#f8f8f8" },
  },
  footer: {
    label: "Footer", group: "layout", isContainer: true,
    icon: `<path d="M3 20h18v-4H3zM3 14h18" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
    defaultStyle: { display: "block", padding: "24px", backgroundColor: "#1f2937", color: "#fff" },
  },
  nav: {
    label: "Navbar", group: "layout", isContainer: true,
    icon: `<path d="M4 6h16M4 12h10M4 18h7" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    defaultStyle: { display: "flex", gap: "16px", padding: "12px 24px", alignItems: "center" },
  },
  main: {
    label: "Main", group: "layout", isContainer: true,
    icon: `<rect x="4" y="4" width="16" height="16" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M4 9h16" stroke="currentColor" stroke-width="1"/>`,
    defaultStyle: { display: "block", padding: "24px", minHeight: "200px" },
  },
  article: {
    label: "Article", group: "layout", isContainer: true,
    icon: `<path d="M4 4h16v3H4zM4 9h16M4 13h10M4 17h12" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    defaultStyle: { display: "block", padding: "24px", maxWidth: "720px", margin: "0 auto" },
  },
  aside: {
    label: "Sidebar", group: "layout", isContainer: true,
    icon: `<rect x="3" y="3" width="6" height="18" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/><rect x="11" y="3" width="10" height="18" rx="1" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
    defaultStyle: { display: "block", width: "280px", padding: "16px", backgroundColor: "#f9fafb" },
  },

  // ── Typography ───────────────────────────────────────────────────────────
  h1: {
    label: "Heading 1", group: "typography",
    icon: `<text x="4" y="17" font-size="14" font-weight="bold" fill="currentColor">H1</text>`,
    defaultText: "Heading 1", defaultStyle: { fontSize: "2.5rem", fontWeight: "700", lineHeight: "1.2" },
  },
  h2: {
    label: "Heading 2", group: "typography",
    icon: `<text x="4" y="17" font-size="14" font-weight="bold" fill="currentColor">H2</text>`,
    defaultText: "Heading 2", defaultStyle: { fontSize: "2rem", fontWeight: "600" },
  },
  h3: {
    label: "Heading 3", group: "typography",
    icon: `<text x="4" y="17" font-size="13" font-weight="bold" fill="currentColor">H3</text>`,
    defaultText: "Heading 3", defaultStyle: { fontSize: "1.5rem", fontWeight: "600" },
  },
  h4: {
    label: "Heading 4", group: "typography",
    icon: `<text x="4" y="17" font-size="12" font-weight="bold" fill="currentColor">H4</text>`,
    defaultText: "Heading 4", defaultStyle: { fontSize: "1.25rem", fontWeight: "600" },
  },
  p: {
    label: "Paragraph", group: "typography",
    icon: `<path d="M4 5h16M4 9h16M4 13h16M4 17h10" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    defaultText: "This is a paragraph. Click to edit.", defaultStyle: { fontSize: "1rem", lineHeight: "1.6" },
  },
  span: {
    label: "Span", group: "typography",
    icon: `<path d="M7 8l-4 4 4 4M17 8l4 4-4 4M14 4l-4 16" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    defaultText: "Inline text",
  },
  blockquote: {
    label: "Blockquote", group: "typography",
    icon: `<path d="M6 10l-2 4h4l-2 4M14 10l-2 4h4l-2 4" stroke="currentColor" stroke-width="1.5"/>`,
    defaultText: "This is a blockquote.",
    defaultStyle: { borderLeft: "4px solid #7c3aed", paddingLeft: "16px", fontStyle: "italic", color: "#4b5563" },
  },
  a: {
    label: "Link", group: "typography",
    icon: `<path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" stroke="currentColor" stroke-width="1.5"/>`,
    defaultText: "Click here",
    defaultAttrs: { href: "#", target: "_self" },
    defaultStyle: { color: "#7c3aed", textDecoration: "underline" },
  },
  ul: {
    label: "List (ul)", group: "typography", isContainer: true,
    icon: `<path d="M9 6h11M9 12h11M9 18h11M5 6h.01M5 12h.01M5 18h.01" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    defaultHTML: "<li>List item one</li><li>List item two</li><li>List item three</li>",
  },
  ol: {
    label: "List (ol)", group: "typography", isContainer: true,
    icon: `<path d="M10 6h11M10 12h11M10 18h11M4 6h1v4M4 12h2M4 16h2v1h-2v1h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    defaultHTML: "<li>First item</li><li>Second item</li><li>Third item</li>",
  },

  // ── Media ─────────────────────────────────────────────────────────────────
  img: {
    label: "Image", group: "media",
    icon: `<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="1.5"/>`,
    defaultAttrs: { src: "https://placehold.co/600x400/e2e8f0/94a3b8?text=Image", alt: "Image" },
    defaultStyle: { maxWidth: "100%", display: "block" },
  },
  video: {
    label: "Video", group: "media",
    icon: `<path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
    defaultAttrs: { controls: "controls", src: "" },
    defaultStyle: { maxWidth: "100%", display: "block" },
  },
  iframe: {
    label: "iFrame", group: "media",
    icon: `<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M3 9h18" stroke="currentColor" stroke-width="1"/>`,
    defaultAttrs: { src: "https://www.youtube.com/embed/dQw4w9WgXcQ", frameborder: "0", allowfullscreen: "true" },
    defaultStyle: { width: "560px", height: "315px", border: "none" },
  },
  hr: {
    label: "Divider", group: "media",
    icon: `<path d="M3 12h18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>`,
    defaultStyle: { border: "none", borderTop: "2px solid #e5e7eb", margin: "24px 0" },
  },

  // ── Forms ─────────────────────────────────────────────────────────────────
  form: {
    label: "Form", group: "forms", isContainer: true,
    icon: `<rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M3 10h18" stroke="currentColor" stroke-width="1"/>`,
    defaultStyle: { display: "flex", flexDirection: "column", gap: "12px", padding: "24px", maxWidth: "480px" },
  },
  input: {
    label: "Input", group: "forms",
    icon: `<rect x="3" y="8" width="18" height="8" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M7 12h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    defaultAttrs: { type: "text", placeholder: "Enter text…", name: "field" },
    defaultStyle: { padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "1rem", width: "100%", boxSizing: "border-box" },
  },
  textarea: {
    label: "Textarea", group: "forms",
    icon: `<rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M7 8h10M7 12h10M7 16h6" stroke="currentColor" stroke-width="1"/>`,
    defaultAttrs: { placeholder: "Write something…", rows: "4", name: "message" },
    defaultStyle: { padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "1rem", width: "100%", resize: "vertical" },
  },
  select: {
    label: "Select", group: "forms",
    icon: `<path d="M3 8a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2H5a2 2 0 01-2-2V8zM7 14l5 5 5-5" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
    defaultHTML: "<option>Option 1</option><option>Option 2</option><option>Option 3</option>",
    defaultAttrs: { name: "select" },
    defaultStyle: { padding: "10px 14px", border: "1px solid #d1d5db", borderRadius: "6px", fontSize: "1rem", width: "100%" },
  },
  button: {
    label: "Button", group: "forms",
    icon: `<rect x="3" y="8" width="18" height="8" rx="4" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M9 12h6" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>`,
    defaultText: "Click Me",
    defaultAttrs: { type: "button" },
    defaultStyle: { padding: "10px 24px", backgroundColor: "#7c3aed", color: "#fff", border: "none", borderRadius: "6px", fontSize: "1rem", cursor: "pointer" },
  },
  label: {
    label: "Label", group: "forms",
    icon: `<path d="M7 7h10l2 5-2 5H7l-2-5z" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
    defaultText: "Field Label",
    defaultStyle: { display: "block", fontWeight: "500", marginBottom: "4px" },
  },

  // ── HTMX Interactive ──────────────────────────────────────────────────────
  "div[hx-modal]": {
    label: "Modal", group: "htmx", isContainer: true,
    icon: `<rect x="5" y="5" width="14" height="14" rx="2" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M5 9h14" stroke="currentColor" stroke-width="1"/>`,
    defaultStyle: { position: "fixed", inset: "0", backgroundColor: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: "1000" },
  },
  "div[hx-tabs]": {
    label: "Tabs", group: "htmx", isContainer: true,
    icon: `<path d="M4 8h4v12H4zM10 5h4v15h-4zM16 10h4v10h-4z" stroke="currentColor" stroke-width="1.5" fill="none"/>`,
    defaultHTML: `<div style="display:flex;gap:8px;border-bottom:2px solid #e5e7eb;margin-bottom:16px">
  <button hx-get="/tab/1" hx-target="#tab-content" style="padding:8px 16px;border:none;background:none;cursor:pointer;font-weight:600">Tab 1</button>
  <button hx-get="/tab/2" hx-target="#tab-content" style="padding:8px 16px;border:none;background:none;cursor:pointer">Tab 2</button>
</div>
<div id="tab-content" style="padding:16px">Tab 1 content here.</div>`,
  },
  "div[hx-search]": {
    label: "Live Search", group: "htmx", isContainer: true,
    icon: `<circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="1.5" fill="none"/><path d="M21 21l-4.35-4.35" stroke="currentColor" stroke-width="1.5"/>`,
    defaultHTML: `<input type="search" name="q" placeholder="Search…"
  hx-get="/api/search" hx-target="#results" hx-trigger="keyup changed delay:300ms"
  style="width:100%;padding:10px 14px;border:1px solid #d1d5db;border-radius:6px;font-size:1rem" />
<div id="results" style="margin-top:12px"></div>`,
  },
};

// ── Group config ──────────────────────────────────────────────────────────
const GROUPS = {
  layout:     { containerId: "layout-elements",     label: "Layout" },
  typography: { containerId: "typography-elements", label: "Typography" },
  media:      { containerId: "media-elements",      label: "Media" },
  forms:      { containerId: "form-elements",        label: "Forms" },
  htmx:       { containerId: "htmx-elements",       label: "Interactive (HTMX)" },
};

// ── Render element tiles into sidebar ────────────────────────────────────
export function renderElementLibrary() {
  Object.entries(ELEMENT_DEFINITIONS).forEach(([tag, def]) => {
    const container = document.getElementById(GROUPS[def.group]?.containerId);
    if (!container) return;

    const tile = document.createElement("div");
    tile.className = "element-tile";
    tile.draggable = true;
    tile.dataset.tag = tag;
    tile.innerHTML = `
      <svg class="w-6 h-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        ${def.icon || ""}
      </svg>
      <span>${def.label}</span>
    `;

    // Click-to-add
    tile.addEventListener("click", () => dropElement(tag, def.group));

    // Drag start: store tag in dataTransfer
    tile.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", tag);
      e.dataTransfer.effectAllowed = "copy";
    });

    container.appendChild(tile);
  });
}

// ── Filter elements by search query ──────────────────────────────────────
window.filterElements = function (query) {
  const q = query.toLowerCase();
  document.querySelectorAll(".element-tile").forEach(tile => {
    const tag   = tile.dataset.tag || "";
    const label = tile.textContent.toLowerCase();
    tile.style.display = (!q || label.includes(q) || tag.includes(q)) ? "" : "none";
  });
};

// ── Initialize on DOM ready ───────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", renderElementLibrary);

// ── Canvas drop zone: accept from external drag ───────────────────────────
const canvas = document.getElementById("canvas");

canvas.addEventListener("dragover", (e) => {
  e.preventDefault();
  e.dataTransfer.dropEffect = "copy";
  canvas.classList.add("nc-drop-active");
});

canvas.addEventListener("dragleave", () => {
  canvas.classList.remove("nc-drop-active");
});

canvas.addEventListener("drop", (e) => {
  e.preventDefault();
  canvas.classList.remove("nc-drop-active");
  const tag = e.dataTransfer.getData("text/plain");
  if (tag && ELEMENT_DEFINITIONS[tag]) dropElement(tag);
});