import { selectElement } from "./canvas.js";

export function renderLayersTree(canvas) {
  const container = document.getElementById("layers-tree");
  if (!container) return;
  container.innerHTML = "";

  const children = [...canvas.children].filter(el =>
    el.id !== "canvas-empty-hint" && el.dataset.ncId
  );

  if (!children.length) {
    container.innerHTML = `<p class="text-xs text-gray-600 text-center mt-8">Drop elements onto the canvas.</p>`;
    return;
  }
  children.forEach(el => container.appendChild(buildItem(el, 0)));
}

function buildItem(el, depth) {
  const wrap = document.createElement("div");
  const tag  = el.tagName.toLowerCase();

  const item = document.createElement("div");
  item.className = "layer-item";
  item.dataset.ncId = el.dataset.ncId;
  item.style.paddingLeft = `${depth * 12 + 8}px`;

  const nested = [...el.children].filter(c => c.dataset.ncId && !c.classList.contains("nc-toolbar"));

  item.innerHTML = `
    <span style="color:#6b7280;font-size:10px;font-family:monospace">&lt;${tag}&gt;</span>
    <span class="flex-1 truncate" style="font-size:11px">${getLabel(el)}</span>
    <button class="layer-eye" data-id="${el.dataset.ncId}" title="Toggle visibility"
      style="opacity:0;padding:2px;background:none;border:none;color:#6b7280;cursor:pointer">
      <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
      </svg>
    </button>`;

  item.addEventListener("mouseenter", () => item.querySelector(".layer-eye").style.opacity = "1");
  item.addEventListener("mouseleave", () => item.querySelector(".layer-eye").style.opacity = "0");

  item.querySelector(".layer-eye").addEventListener("click", e => {
    e.stopPropagation();
    const target = document.querySelector(`[data-nc-id="${el.dataset.ncId}"]`);
    if (!target) return;
    const hidden = target.style.visibility === "hidden";
    target.style.visibility = hidden ? "" : "hidden";
    e.currentTarget.style.opacity = hidden ? "0.4" : "1";
  });

  item.addEventListener("click", e => {
    e.stopPropagation();
    const target = document.querySelector(`[data-nc-id="${el.dataset.ncId}"]`);
    if (target) selectElement(target);
  });

  wrap.appendChild(item);

  if (nested.length) {
    const childWrap = document.createElement("div");
    nested.forEach(c => childWrap.appendChild(buildItem(c, depth + 1)));
    wrap.appendChild(childWrap);
  }
  return wrap;
}

function getLabel(el) {
  if (el.id && !el.id.startsWith("nc-el")) return `#${el.id}`;
  const text = el.textContent?.trim().replace(/\s+/g," ").slice(0,22);
  return text || el.getAttribute("src")?.split("/").pop()?.slice(0,22) || "";
}