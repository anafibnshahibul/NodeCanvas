/**
 * stylePanel.js — Bidirectional sync between the right panel UI
 * and the selected element's inline styles / attributes / HTMX attrs.
 *
 * "Apply" direction: panel input → element.style / element.setAttribute
 * "Sync" direction:  element     → panel input values (on selection change)
 */

import { getSelectedElement } from "./canvas.js";
import { pushHistory }        from "./history.js";

// ── Apply a CSS property directly to the selected element ─────────────────
window.applyStyle = function (prop, value) {
  const el = getSelectedElement();
  if (!el) return;
  pushHistory();
  el.style[prop] = value;

  // Side-effect: show/hide flex controls
  if (prop === "display") {
    document.getElementById("flex-controls")?.classList.toggle("hidden", value !== "flex");
  }
};

// ── Box model shorthand (marginTop, paddingLeft, etc.) ────────────────────
window.applyBoxModel = function (prop, side, value) {
  const el = getSelectedElement();
  if (!el || !value) return;
  pushHistory();
  // Append "px" if bare number
  const v = /^\d+$/.test(value.trim()) ? value.trim() + "px" : value.trim();
  el.style[`${prop}${side}`] = v;
};

// ── Background type switcher ───────────────────────────────────────────────
window.switchBgType = function (type) {
  ["bg-color-ctrl", "bg-gradient-ctrl", "bg-image-ctrl"].forEach(id => {
    document.getElementById(id)?.classList.add("hidden");
  });
  if (type !== "none") {
    document.getElementById(`bg-${type}-ctrl`)?.classList.remove("hidden");
  }
  const el = getSelectedElement();
  if (!el) return;
  if (type === "none") { el.style.background = ""; el.style.backgroundColor = ""; }
};

// ── Gradient helper ────────────────────────────────────────────────────────
window.applyGradient = function () {
  const el = getSelectedElement();
  if (!el) return;
  const c1    = document.getElementById("grad-color1")?.value || "#6366f1";
  const c2    = document.getElementById("grad-color2")?.value || "#9333ea";
  const angle = document.getElementById("grad-angle")?.value  || "135";
  el.style.background = `linear-gradient(${angle}deg, ${c1}, ${c2})`;
};

// ── HTMX attribute setters ─────────────────────────────────────────────────
window.applyHTMX = function (attr, value) {
  const el = getSelectedElement();
  if (!el) return;
  pushHistory();
  if (value) el.setAttribute(attr, value);
  else       el.removeAttribute(attr);
};

let currentHTMXMethod = "hx-get";

window.setHTMXMethod = function (method, btn) {
  currentHTMXMethod = method;
  document.querySelectorAll(".htmx-method-btn").forEach(b => b.classList.remove("active"));
  btn.classList.add("active");
};

window.applyHTMXMethod = function (url) {
  const el = getSelectedElement();
  if (!el || !url) return;
  // Remove all method attrs first
  ["hx-get","hx-post","hx-put","hx-patch","hx-delete"].forEach(m => el.removeAttribute(m));
  if (url) el.setAttribute(currentHTMXMethod, url);
};

// ── Conditional logic (stored as data attrs, wired via htmx events) ────────
window.setConditional = function (event, action, selector) {
  const el = getSelectedElement();
  if (!el) return;
  el.dataset[`nc${event}${action}`] = selector;
  // Inject htmx event listener script (serialized with the element)
  const script = `
    htmx.on('[data-nc-id="${el.dataset.ncId}"]', 'htmx:afterRequest', (e) => {
      if (e.detail.xhr.status < 400) {
        ${buildConditionalJS(el, "success")}
      } else {
        ${buildConditionalJS(el, "error")}
      }
    });
  `;
  el.dataset.ncConditionalScript = script;
};

function buildConditionalJS(el, event) {
  const lines = [];
  const show = el.dataset[`nc${event}show`];
  const hide = el.dataset[`nc${event}hide`];
  if (show) lines.push(`document.querySelector('${show}')?.classList.remove('hidden');`);
  if (hide) lines.push(`document.querySelector('${hide}')?.classList.add('hidden');`);
  return lines.join("\n");
}

// ── Animation preset applier ───────────────────────────────────────────────
const ALL_ANIM_CLASSES = [
  "nc-anim-fadeIn","nc-anim-fadeOut","nc-anim-slideInLeft","nc-anim-slideInRight",
  "nc-anim-slideInUp","nc-anim-slideInDown","nc-anim-zoomIn","nc-anim-zoomOut",
  "nc-anim-bounce","nc-anim-pulse","nc-anim-shake"
];

window.applyAnimPreset = function (preset) {
  const el = getSelectedElement();
  if (!el) return;
  pushHistory();
  el.classList.remove(...ALL_ANIM_CLASSES);
  if (preset) el.classList.add(`nc-anim-${preset}`);
};

window.applyTransition = function (prop, value) {
  const el = getSelectedElement();
  if (!el || !value) return;
  pushHistory();
  const map = {
    duration:  "--nc-dur",
    delay:     "--nc-delay",
    timing:    "--nc-ease",
    iteration: "--nc-iter",
  };
  el.style.setProperty(map[prop], value);
};

window.setAnimTrigger = function (trigger) {
  const el = getSelectedElement();
  if (!el) return;
  el.dataset.ncAnimTrigger = trigger;
  // scroll trigger uses Intersection Observer (injected by export engine)
  if (trigger === "scroll") {
    el.style.opacity = "0"; // starts hidden
    el.dataset.ncAnimScroll = "1";
  }
};

// ── Content updaters ──────────────────────────────────────────────────────
window.updateElementContent = function (type, value) {
  const el = getSelectedElement();
  if (!el) return;
  pushHistory();
  if (type === "text") el.textContent = value;
  if (type === "html") el.innerHTML   = value;
};

window.updateElementAttr = function (attr, value) {
  const el = getSelectedElement();
  if (!el) return;
  pushHistory();
  if (attr === "className") el.className = value + (el.classList.contains("nc-selected") ? " nc-selected" : "");
  else if (attr === "id")   el.id = value;
  else                      el.setAttribute(attr, value);
};

window.updateCustomAttrs = function (json) {
  const el = getSelectedElement();
  if (!el) return;
  try {
    const obj = JSON.parse(json);
    Object.entries(obj).forEach(([k, v]) => el.setAttribute(k, v));
  } catch { /* invalid JSON while typing, silently ignore */ }
};

// ── Sync panel inputs FROM selected element ───────────────────────────────
export function syncPanelToElement(el) {
  const cs = window.getComputedStyle(el);
  const s  = el.style;

  // Tag badge
  const badge = document.getElementById("selected-tag-badge");
  if (badge) badge.textContent = `<${el.tagName.toLowerCase()}>`;

  // ID input
  const idInput = document.getElementById("selected-id");
  if (idInput) idInput.value = el.id || "";

  // ── Style tab ──────────────────────────────────────────────────────────
  safeSet("prop-width",     s.width     || "");
  safeSet("prop-height",    s.height    || "");
  safeSet("prop-font-size", s.fontSize  || "");

  // Colors
  const colorInput = document.getElementById("prop-color");
  if (colorInput) colorInput.value = rgbToHex(cs.color) || "#000000";

  // Display — show flex controls
  const display = s.display || cs.display;
  const displaySel = document.querySelector('[onchange="applyStyle(\'display\', this.value)"]');
  if (displaySel) displaySel.value = display;
  document.getElementById("flex-controls")?.classList.toggle("hidden", display !== "flex");

  // ── Content tab ────────────────────────────────────────────────────────
  const innerText = document.getElementById("prop-innertext");
  if (innerText) innerText.value = el.childNodes.length === 1 && el.firstChild.nodeType === 3
    ? el.textContent : "";

  const classes = document.getElementById("prop-classes");
  if (classes) classes.value = Array.from(el.classList)
    .filter(c => !c.startsWith("nc-"))
    .join(" ");

  // ── HTMX tab ───────────────────────────────────────────────────────────
  const urlInput = document.getElementById("htmx-url-input");
  if (urlInput) {
    const method = ["hx-get","hx-post","hx-put","hx-delete"]
      .find(m => el.hasAttribute(m));
    urlInput.value = method ? el.getAttribute(method) : "";
    if (method) {
      document.querySelectorAll(".htmx-method-btn").forEach(b => {
        b.classList.toggle("active", b.dataset.method === method);
      });
      currentHTMXMethod = method;
    }
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────
function safeSet(id, value) {
  const el = document.getElementById(id);
  if (el) el.value = value;
}

function rgbToHex(rgb) {
  if (!rgb || rgb === "rgba(0, 0, 0, 0)") return null;
  const m = rgb.match(/(\d+),\s*(\d+),\s*(\d+)/);
  if (!m) return null;
  return "#" + [m[1],m[2],m[3]].map(n => parseInt(n).toString(16).padStart(2,"0")).join("");
}