import { getSelectedElement } from "./canvas.js";

export function initStylePanel() {
  // nothing to init — main.js wires all events
}

export function syncPanelToElement(el) {
  const s  = el.style;
  const cs = window.getComputedStyle(el);

  // Tag badge
  const badge = document.getElementById("selected-tag-badge");
  if (badge) badge.textContent = `<${el.tagName.toLowerCase()}>`;

  // ID
  const idInput = document.getElementById("selected-id");
  if (idInput) idInput.value = el.id || "";

  // Layout
  setVal("sp-display",  s.display || "");
  setVal("sp-position", s.position || "");
  document.getElementById("flex-controls")?.classList.toggle("hidden", s.display !== "flex");
  setVal("sp-flex-direction", s.flexDirection || "");
  setVal("sp-flex-wrap",      s.flexWrap || "");
  setVal("sp-justify",        s.justifyContent || "");
  setVal("sp-align",          s.alignItems || "");
  setVal("sp-gap",            s.gap || "");

  // Box model
  setVal("sp-width",   s.width   || "");
  setVal("sp-height",  s.height  || "");
  setVal("sp-minw",    s.minWidth || "");
  setVal("sp-maxw",    s.maxWidth || "");
  setVal("sp-padding", s.padding || "");
  setVal("sp-margin",  s.margin  || "");

  // Typography
  setVal("sp-font-family",    s.fontFamily || "");
  setVal("sp-font-size",      s.fontSize   || "");
  setVal("sp-font-weight",    s.fontWeight || "");
  setVal("sp-line-height",    s.lineHeight || "");
  setVal("sp-letter-spacing", s.letterSpacing || "");

  const colorHex = rgbToHex(cs.color);
  if (colorHex) {
    setVal("sp-color",     colorHex);
    setVal("sp-color-hex", colorHex);
  }

  // Border & effects
  setVal("sp-border-width",  s.borderWidth  || "");
  setVal("sp-border-style",  s.borderStyle  || "");
  setVal("sp-border-radius", s.borderRadius || "");
  setVal("sp-box-shadow",    s.boxShadow    || "");
  setVal("sp-filter",        s.filter       || "");

  const opacity = s.opacity;
  const opEl = document.getElementById("sp-opacity");
  if (opEl && opacity) opEl.value = Math.round(parseFloat(opacity) * 100);

  // Content tab
  setVal("sp-innertext", el.childNodes.length === 1 && el.firstChild.nodeType === 3 ? el.textContent : "");
  setVal("sp-classes",   [...el.classList].filter(c => !c.startsWith("nc-")).join(" "));

  // HTMX tab
  const method = ["hx-get","hx-post","hx-put","hx-delete"].find(m => el.hasAttribute(m));
  setVal("sp-hx-url",     method ? el.getAttribute(method) : "");
  setVal("sp-hx-trigger", el.getAttribute("hx-trigger") || "");
  setVal("sp-hx-target",  el.getAttribute("hx-target")  || "");
  setVal("sp-hx-swap",    el.getAttribute("hx-swap")    || "innerHTML");
  if (method) {
    document.querySelectorAll(".htmx-method-btn").forEach(b => {
      b.classList.toggle("active", b.dataset.method === method);
    });
  }
}

function setVal(id, value) {
  const el = document.getElementById(id);
  if (el && el.value !== undefined) el.value = value;
}

function rgbToHex(rgb) {
  if (!rgb || rgb === "rgba(0, 0, 0, 0)") return null;
  const m = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return "#" + [m[1],m[2],m[3]].map(n => parseInt(n).toString(16).padStart(2,"0")).join("");
}