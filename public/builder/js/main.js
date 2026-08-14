import { initCanvas, dropElement, selectElement,
         clearCanvasSelection, getSelectedElement,
         serializeCanvas, deserializeCanvas }  from "./canvas.js";
import { syncPanelToElement, initStylePanel }  from "./stylePanel.js";
import { renderLayersTree }                    from "./layersPanel.js";
import { renderElementLibrary }                from "./elementLibrary.js";
import { pushHistory, initHistory }            from "./history.js";

// ── IDs injected by EJS into window ──────────────────────────────────────
const PROJECT_ID = window.NC_PROJECT_ID;
const PAGE_ID    = window.NC_PAGE_ID;
const PAGE_DATA  = window.NC_PAGE_DATA;

// ─────────────────────────────────────────────────────────────────────────
// BOOT
// ─────────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderElementLibrary();
  initCanvas();
  initStylePanel();
  initHistory();

  // Load saved canvas if page has data
  if (PAGE_DATA && PAGE_DATA.children?.length) {
    deserializeCanvas(PAGE_DATA);
  }

  wireToolbar();
  wireLeftTabs();
  wirePropTabs();
  wireRightPanel();
  wirePageTabs();
  wireKeyboard();
  wireContextMenu();
  wireMediaModal();
  wireExportMenu();
});

// ─────────────────────────────────────────────────────────────────────────
// TOOLBAR
// ─────────────────────────────────────────────────────────────────────────
function wireToolbar() {
  // Viewport switcher
  document.querySelectorAll(".viewport-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const widths = { desktop: "1280px", tablet: "768px", mobile: "390px" };
      document.getElementById("canvas-frame-container").style.width = widths[btn.dataset.viewport];
      document.querySelectorAll(".viewport-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // Save button
  document.getElementById("btn-save")?.addEventListener("click", savePage);

  // Undo / Redo
  document.getElementById("btn-undo")?.addEventListener("click", () => window._historyUndo?.());
  document.getElementById("btn-redo")?.addEventListener("click", () => window._historyRedo?.());
}

async function savePage() {
  const btn  = document.getElementById("btn-save");
  const icon = document.getElementById("save-icon");
  if (!PAGE_ID) return;

  btn.disabled = true;
  icon.innerHTML = `<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>`;
  icon.classList.add("animate-spin");

  try {
    const canvas = serializeCanvas();
    const res = await fetch(`/api/projects/${PROJECT_ID}/pages/${PAGE_ID}/save`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ canvasState: JSON.stringify(canvas) }),
    });
    if (res.ok) {
      btn.style.background = "#059669";
      setTimeout(() => { btn.style.background = ""; btn.disabled = false; }, 1500);
    }
  } catch (e) {
    console.error("Save failed", e);
    btn.disabled = false;
  }
  icon.classList.remove("animate-spin");
  icon.innerHTML = `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"/>`;
}

// ─────────────────────────────────────────────────────────────────────────
// LEFT SIDEBAR TABS
// ─────────────────────────────────────────────────────────────────────────
function wireLeftTabs() {
  document.querySelectorAll(".left-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      ["elements","layers","templates"].forEach(t => {
        document.getElementById(`tab-${t}`)?.classList.toggle("hidden", t !== tab);
      });
      document.querySelectorAll(".left-tab").forEach(b => {
        b.classList.toggle("active", b.dataset.tab === tab);
        b.classList.toggle("text-gray-500", b.dataset.tab !== tab);
      });
    });
  });

  // Element search
  document.getElementById("element-search")?.addEventListener("input", (e) => {
    const q = e.target.value.toLowerCase();
    document.querySelectorAll(".element-tile").forEach(tile => {
      tile.style.display = (!q || tile.textContent.toLowerCase().includes(q)) ? "" : "none";
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────
// PROPERTY PANEL TABS
// ─────────────────────────────────────────────────────────────────────────
function wirePropTabs() {
  document.querySelectorAll(".prop-tab").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.ptab;
      ["style","content","htmx","anim"].forEach(t => {
        document.getElementById(`ptab-${t}`)?.classList.toggle("hidden", t !== tab);
      });
      document.querySelectorAll(".prop-tab").forEach(b => {
        b.classList.toggle("active", b.dataset.ptab === tab);
        b.classList.toggle("text-gray-500", b.dataset.ptab !== tab);
      });
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────
// RIGHT PANEL — wire all inputs to applyStyle
// ─────────────────────────────────────────────────────────────────────────
function wireRightPanel() {
  const bind = (id, fn) => document.getElementById(id)?.addEventListener("input", fn);
  const bindChange = (id, fn) => document.getElementById(id)?.addEventListener("change", fn);

  // Layout
  bindChange("sp-display", e => { applyStyle("display", e.target.value); document.getElementById("flex-controls")?.classList.toggle("hidden", e.target.value !== "flex"); });
  bindChange("sp-position",       e => applyStyle("position", e.target.value));
  bindChange("sp-flex-direction", e => applyStyle("flexDirection", e.target.value));
  bindChange("sp-flex-wrap",      e => applyStyle("flexWrap", e.target.value));
  bindChange("sp-justify",        e => applyStyle("justifyContent", e.target.value));
  bindChange("sp-align",          e => applyStyle("alignItems", e.target.value));
  bind("sp-gap", e => applyStyle("gap", e.target.value));

  // Box model
  bind("sp-width",   e => applyStyle("width", e.target.value));
  bind("sp-height",  e => applyStyle("height", e.target.value));
  bind("sp-minw",    e => applyStyle("minWidth", e.target.value));
  bind("sp-maxw",    e => applyStyle("maxWidth", e.target.value));
  bind("sp-padding", e => applyStyle("padding", e.target.value));
  bind("sp-margin",  e => applyStyle("margin", e.target.value));

  // Typography
  bindChange("sp-font-family",    e => applyStyle("fontFamily", e.target.value));
  bind("sp-font-size",            e => applyStyle("fontSize", e.target.value));
  bindChange("sp-font-weight",    e => applyStyle("fontWeight", e.target.value));
  bind("sp-line-height",          e => applyStyle("lineHeight", e.target.value));
  bind("sp-letter-spacing",       e => applyStyle("letterSpacing", e.target.value));
  bind("sp-color",    e => { applyStyle("color", e.target.value); const h = document.getElementById("sp-color-hex"); if(h) h.value = e.target.value; });
  bind("sp-color-hex",e => { applyStyle("color", e.target.value); const c = document.getElementById("sp-color"); if(c) c.value = e.target.value; });

  // Text align buttons
  ["left","center","right","justify"].forEach(align => {
    document.getElementById(`ta-${align}`)?.addEventListener("click", () => applyStyle("textAlign", align));
  });

  // Background
  bindChange("sp-bg-type", e => {
    const t = e.target.value;
    document.getElementById("bg-color-ctrl")?.classList.toggle("hidden", t !== "color");
    document.getElementById("bg-gradient-ctrl")?.classList.toggle("hidden", t !== "gradient");
    if (t === "none") applyStyle("background", "");
  });
  const applyGradient = () => {
    const c1 = document.getElementById("grad-c1")?.value || "#6366f1";
    const c2 = document.getElementById("grad-c2")?.value || "#9333ea";
    const a  = document.getElementById("grad-angle")?.value || "135";
    applyStyle("background", `linear-gradient(${a}deg,${c1},${c2})`);
  };
  bind("sp-bg-color",     e => applyStyle("backgroundColor", e.target.value));
  bind("sp-bg-color-hex", e => applyStyle("backgroundColor", e.target.value));
  ["grad-c1","grad-c2","grad-angle"].forEach(id => bind(id, applyGradient));

  // Border & effects
  bind("sp-border-width",  e => applyStyle("borderWidth", e.target.value));
  bindChange("sp-border-style", e => applyStyle("borderStyle", e.target.value));
  bind("sp-border-color",  e => applyStyle("borderColor", e.target.value));
  bind("sp-border-radius", e => applyStyle("borderRadius", e.target.value));
  bind("sp-box-shadow",    e => applyStyle("boxShadow", e.target.value));
  bind("sp-opacity",       e => applyStyle("opacity", e.target.value / 100));
  bind("sp-filter",        e => applyStyle("filter", e.target.value));

  // Content tab
  bind("sp-innertext",  e => { const el = getSelectedElement(); if(el) el.textContent = e.target.value; });
  bind("sp-innerhtml",  e => { const el = getSelectedElement(); if(el) el.innerHTML  = e.target.value; });
  bind("sp-classes",    e => { const el = getSelectedElement(); if(!el) return; const nc = [...el.classList].filter(c=>c.startsWith("nc-")).join(" "); el.className = e.target.value + (nc ? " "+nc : ""); });
  bind("sp-attrs",      e => { const el = getSelectedElement(); if(!el) return; try { Object.entries(JSON.parse(e.target.value)).forEach(([k,v])=>el.setAttribute(k,v)); } catch{} });

  // HTMX tab
  bindChange("sp-hx-trigger", e => applyAttr("hx-trigger", e.target.value));
  bind("sp-hx-url",    e => { const m = document.querySelector(".htmx-method-btn.active")?.dataset.method || "hx-get"; applyAttr(m, e.target.value); });
  bind("sp-hx-target", e => applyAttr("hx-target", e.target.value));
  bindChange("sp-hx-swap", e => applyAttr("hx-swap", e.target.value));

  document.querySelectorAll(".htmx-method-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".htmx-method-btn").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
    });
  });

  // ID input
  document.getElementById("selected-id")?.addEventListener("input", e => {
    const el = getSelectedElement();
    if (el) el.id = e.target.value;
  });

  // Delete button
  document.getElementById("btn-delete-el")?.addEventListener("click", () => {
    const el = getSelectedElement();
    if (!el) return;
    pushHistory();
    el.remove();
    clearCanvasSelection();
  });

  // Animation tab
  bindChange("sp-anim-preset", e => {
    const el = getSelectedElement();
    if (!el) return;
    el.classList.remove(...["fadeIn","fadeOut","slideInLeft","slideInRight","slideInUp","slideInDown","zoomIn","zoomOut","bounce","pulse","shake"].map(n=>`nc-anim-${n}`));
    if (e.target.value) el.classList.add(`nc-anim-${e.target.value}`);
  });
  bind("sp-anim-dur",   e => { const el = getSelectedElement(); if(el) el.style.setProperty("--nc-dur", e.target.value); });
  bind("sp-anim-delay", e => { const el = getSelectedElement(); if(el) el.style.setProperty("--nc-delay", e.target.value); });
  bindChange("sp-anim-ease", e => { const el = getSelectedElement(); if(el) el.style.setProperty("--nc-ease", e.target.value); });
  bindChange("sp-anim-iter", e => { const el = getSelectedElement(); if(el) el.style.setProperty("--nc-iter", e.target.value); });
}

function applyStyle(prop, value) {
  const el = getSelectedElement();
  if (!el) return;
  pushHistory();
  el.style[prop] = value;
}

function applyAttr(attr, value) {
  const el = getSelectedElement();
  if (!el) return;
  if (value) el.setAttribute(attr, value);
  else el.removeAttribute(attr);
}

// ─────────────────────────────────────────────────────────────────────────
// PAGE TABS
// ─────────────────────────────────────────────────────────────────────────
function wirePageTabs() {
  // Add page
  document.getElementById("btn-add-page")?.addEventListener("click", async () => {
    const name = prompt("Page name:", "New Page");
    if (!name) return;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") + "-" + Date.now().toString(36);
    const res  = await fetch(`/api/projects/${PROJECT_ID}/pages`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, slug }),
    });
    if (res.ok) {
      const { page } = await res.json();
      window.location.href = `/builder/editor/${PROJECT_ID}/${page._id}`;
    }
  });

  // Rename page buttons
  document.querySelectorAll(".rename-page-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      const id   = btn.dataset.pageId;
      const name = prompt("New page name:", btn.dataset.pageName);
      if (!name) return;
      await fetch(`/api/projects/${PROJECT_ID}/pages/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      window.location.reload();
    });
  });

  // Delete page buttons
  document.querySelectorAll(".delete-page-btn").forEach(btn => {
    btn.addEventListener("click", async () => {
      if (!confirm("Delete this page? This cannot be undone.")) return;
      const res = await fetch(`/api/projects/${btn.dataset.projectId}/pages/${btn.dataset.pageId}`, { method: "DELETE" });
      if (res.ok) window.location.href = `/builder/editor/${PROJECT_ID}`;
      else {
        const err = await res.json();
        alert(err.error || "Could not delete page.");
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────
// KEYBOARD SHORTCUTS
// ─────────────────────────────────────────────────────────────────────────
function wireKeyboard() {
  document.addEventListener("keydown", e => {
    const tag = document.activeElement.tagName;
    if (["INPUT","TEXTAREA","SELECT"].includes(tag)) return;

    if (e.ctrlKey && e.key === "z" && !e.shiftKey) { e.preventDefault(); window._historyUndo?.(); }
    if ((e.ctrlKey && e.key === "y") || (e.ctrlKey && e.shiftKey && e.key === "z")) { e.preventDefault(); window._historyRedo?.(); }
    if (e.ctrlKey && e.key === "s") { e.preventDefault(); savePage(); }
    if (e.ctrlKey && e.key === "d") { e.preventDefault(); window._duplicateSelected?.(); }
    if (e.key === "Delete" || e.key === "Backspace") {
      const el = getSelectedElement();
      if (el) { pushHistory(); el.remove(); clearCanvasSelection(); }
    }
    if (e.key === "Escape") clearCanvasSelection();
  });
}

// ─────────────────────────────────────────────────────────────────────────
// CONTEXT MENU
// ─────────────────────────────────────────────────────────────────────────
function wireContextMenu() {
  const menu = document.getElementById("context-menu");
  const canvas = document.getElementById("canvas");

  canvas.addEventListener("contextmenu", e => {
    const el = e.target.closest("[data-nc-id]");
    if (!el) return;
    e.preventDefault();
    window._ctxElement = el;
    menu.style.left = e.clientX + "px";
    menu.style.top  = e.clientY + "px";
    menu.classList.remove("hidden");
  });
  document.addEventListener("click", () => menu.classList.add("hidden"));

  menu.querySelectorAll(".ctx-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const el = window._ctxElement || getSelectedElement();
      if (!el) return;
      switch (btn.dataset.action) {
        case "duplicate":  window._duplicateEl?.(el); break;
        case "copy-style": window._copiedStyle = el.getAttribute("style"); break;
        case "paste-style": if (window._copiedStyle) { el.setAttribute("style", window._copiedStyle); syncPanelToElement(el); } break;
        case "wrap-div":   window._wrapInDiv?.(el); break;
        case "move-up":    el.previousElementSibling?.before(el); break;
        case "move-down":  el.nextElementSibling?.after(el); break;
        case "delete":     pushHistory(); el.remove(); clearCanvasSelection(); break;
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────────────────
// MEDIA MODAL
// ─────────────────────────────────────────────────────────────────────────
function wireMediaModal() {
  document.getElementById("media-modal-close")?.addEventListener("click", () => {
    document.getElementById("media-modal").classList.add("hidden");
  });
}

window.openMediaPicker = function() {
  document.getElementById("media-modal").classList.remove("hidden");
};

window.selectMedia = function(url, filename) {
  const el = getSelectedElement();
  if (!el) return;
  if (el.tagName === "IMG") el.src = url;
  else el.style.backgroundImage = `url('${url}')`;
  document.getElementById("media-modal").classList.add("hidden");
};

// ─────────────────────────────────────────────────────────────────────────
// EXPORT MENU
// ─────────────────────────────────────────────────────────────────────────
function wireExportMenu() {
  const wrapper = document.getElementById("export-menu-wrapper");
  const menu    = document.getElementById("export-menu");
  document.getElementById("export-toggle")?.addEventListener("click", (e) => {
    e.stopPropagation();
    menu?.classList.toggle("hidden");
  });
  document.addEventListener("click", e => {
    if (!wrapper?.contains(e.target)) menu?.classList.add("hidden");
  });
}

// ─────────────────────────────────────────────────────────────────────────
// Template loader
// ─────────────────────────────────────────────────────────────────────────
window.loadTemplate = async function(id) {
  if (!confirm("This will replace the current page canvas. Continue?")) return;
  const res = await fetch(`/api/templates/${id}/canvas`);
  if (!res.ok) return;
  const { canvas } = await res.json();
  pushHistory();
  deserializeCanvas(canvas);
};
