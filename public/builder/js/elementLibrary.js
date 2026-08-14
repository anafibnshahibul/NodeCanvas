import { dropElement } from "./canvas.js";

export const ELEMENT_DEFINITIONS = {
  // Layout
  div:     { label:"Container", group:"layout", isContainer:true, icon:"⬜", defaultStyle:{ display:"block", minHeight:"80px", padding:"16px" } },
  section: { label:"Section",   group:"layout", isContainer:true, icon:"▬", defaultStyle:{ display:"block", padding:"40px 20px", minHeight:"120px" } },
  header:  { label:"Header",    group:"layout", isContainer:true, icon:"▀", defaultStyle:{ display:"flex", alignItems:"center", padding:"16px 24px", backgroundColor:"#f8f8f8" } },
  footer:  { label:"Footer",    group:"layout", isContainer:true, icon:"▄", defaultStyle:{ display:"block", padding:"24px", backgroundColor:"#1f2937", color:"#fff" } },
  nav:     { label:"Navbar",    group:"layout", isContainer:true, icon:"☰", defaultStyle:{ display:"flex", gap:"16px", padding:"12px 24px", alignItems:"center" } },
  main:    { label:"Main",      group:"layout", isContainer:true, icon:"⬛", defaultStyle:{ display:"block", padding:"24px", minHeight:"200px" } },
  article: { label:"Article",   group:"layout", isContainer:true, icon:"📄", defaultStyle:{ display:"block", padding:"24px", maxWidth:"720px", margin:"0 auto" } },
  aside:   { label:"Sidebar",   group:"layout", isContainer:true, icon:"◧", defaultStyle:{ display:"block", width:"280px", padding:"16px", backgroundColor:"#f9fafb" } },

  // Typography
  h1:         { label:"Heading 1",  group:"typography", icon:"H1", defaultText:"Heading 1",  defaultStyle:{ fontSize:"2.5rem", fontWeight:"700", lineHeight:"1.2", margin:"0 0 16px" } },
  h2:         { label:"Heading 2",  group:"typography", icon:"H2", defaultText:"Heading 2",  defaultStyle:{ fontSize:"2rem",   fontWeight:"600" } },
  h3:         { label:"Heading 3",  group:"typography", icon:"H3", defaultText:"Heading 3",  defaultStyle:{ fontSize:"1.5rem", fontWeight:"600" } },
  h4:         { label:"Heading 4",  group:"typography", icon:"H4", defaultText:"Heading 4",  defaultStyle:{ fontSize:"1.25rem",fontWeight:"600" } },
  p:          { label:"Paragraph",  group:"typography", icon:"¶",  defaultText:"This is a paragraph. Click to edit.", defaultStyle:{ fontSize:"1rem", lineHeight:"1.6" } },
  span:       { label:"Span",       group:"typography", icon:"ab", defaultText:"Inline text" },
  a:          { label:"Link",       group:"typography", icon:"🔗", defaultText:"Click here", defaultAttrs:{ href:"#" }, defaultStyle:{ color:"#7c3aed", textDecoration:"underline" } },
  blockquote: { label:"Blockquote", group:"typography", icon:"❝",  defaultText:"This is a quote.", defaultStyle:{ borderLeft:"4px solid #7c3aed", paddingLeft:"16px", fontStyle:"italic", color:"#4b5563" } },
  ul:         { label:"List (ul)",  group:"typography", isContainer:true, icon:"•–", defaultHTML:"<li>Item one</li><li>Item two</li><li>Item three</li>" },
  ol:         { label:"List (ol)",  group:"typography", isContainer:true, icon:"1.", defaultHTML:"<li>First item</li><li>Second item</li>" },

  // Media
  img:    { label:"Image",   group:"media", icon:"🖼", defaultAttrs:{ src:"https://placehold.co/600x400/e2e8f0/94a3b8?text=Image", alt:"Image" }, defaultStyle:{ maxWidth:"100%", display:"block" } },
  video:  { label:"Video",   group:"media", icon:"▶", defaultAttrs:{ controls:"controls", src:"" }, defaultStyle:{ maxWidth:"100%", display:"block" } },
  iframe: { label:"iFrame",  group:"media", icon:"⬚", defaultAttrs:{ src:"https://www.youtube.com/embed/dQw4w9WgXcQ", frameborder:"0" }, defaultStyle:{ width:"560px", height:"315px", border:"none" } },
  hr:     { label:"Divider", group:"media", icon:"—", defaultStyle:{ border:"none", borderTop:"2px solid #e5e7eb", margin:"24px 0" } },

  // Forms
  form:     { label:"Form",     group:"forms", isContainer:true, icon:"📋", defaultStyle:{ display:"flex", flexDirection:"column", gap:"12px", padding:"24px", maxWidth:"480px" } },
  input:    { label:"Input",    group:"forms", icon:"▭", defaultAttrs:{ type:"text", placeholder:"Enter text…", name:"field" }, defaultStyle:{ padding:"10px 14px", border:"1px solid #d1d5db", borderRadius:"6px", fontSize:"1rem", width:"100%" } },
  textarea: { label:"Textarea", group:"forms", icon:"▤", defaultAttrs:{ placeholder:"Write something…", rows:"4", name:"message" }, defaultStyle:{ padding:"10px 14px", border:"1px solid #d1d5db", borderRadius:"6px", fontSize:"1rem", width:"100%", resize:"vertical" } },
  select:   { label:"Select",   group:"forms", icon:"▾", defaultHTML:"<option>Option 1</option><option>Option 2</option>", defaultAttrs:{ name:"select" }, defaultStyle:{ padding:"10px 14px", border:"1px solid #d1d5db", borderRadius:"6px", fontSize:"1rem", width:"100%" } },
  button:   { label:"Button",   group:"forms", icon:"[•]", defaultText:"Click Me", defaultAttrs:{ type:"button" }, defaultStyle:{ padding:"10px 24px", backgroundColor:"#7c3aed", color:"#fff", border:"none", borderRadius:"6px", fontSize:"1rem", cursor:"pointer" } },
  label:    { label:"Label",    group:"forms", icon:"🏷", defaultText:"Field Label", defaultStyle:{ display:"block", fontWeight:"500", marginBottom:"4px" } },
};

const GROUPS = [
  { id:"layout",     label:"Layout",     containerId:"grp-layout" },
  { id:"typography", label:"Typography", containerId:"grp-typography" },
  { id:"media",      label:"Media",      containerId:"grp-media" },
  { id:"forms",      label:"Forms",      containerId:"grp-forms" },
];

export function renderElementLibrary() {
  const root = document.getElementById("element-groups");
  if (!root) return;

  GROUPS.forEach(group => {
    const section = document.createElement("div");
    section.innerHTML = `<p style="font-size:10px;font-weight:600;color:#6b7280;text-transform:uppercase;letter-spacing:.08em;margin-bottom:8px">${group.label}</p>`;
    const grid = document.createElement("div");
    grid.style.cssText = "display:grid;grid-template-columns:1fr 1fr;gap:6px";
    grid.id = group.containerId;
    section.appendChild(grid);
    root.appendChild(section);
  });

  Object.entries(ELEMENT_DEFINITIONS).forEach(([tag, def]) => {
    const grid = document.getElementById(`grp-${def.group}`);
    if (!grid) return;

    const tile = document.createElement("div");
    tile.className = "element-tile";
    tile.draggable = true;
    tile.dataset.tag = tag;
    tile.innerHTML = `<span style="font-size:18px;line-height:1">${def.icon || "◻"}</span><span>${def.label}</span>`;

    tile.addEventListener("click",      () => dropElement(tag));
    tile.addEventListener("dragstart",  e  => { e.dataTransfer.setData("text/plain", tag); e.dataTransfer.effectAllowed = "copy"; });
    grid.appendChild(tile);
  });

  // Canvas external drop handler
  const canvas = document.getElementById("canvas");
  canvas.addEventListener("dragover",  e => { e.preventDefault(); e.dataTransfer.dropEffect = "copy"; canvas.classList.add("nc-drop-active"); });
  canvas.addEventListener("dragleave", ()=> canvas.classList.remove("nc-drop-active"));
  canvas.addEventListener("drop",      e => {
    e.preventDefault();
    canvas.classList.remove("nc-drop-active");
    const tag = e.dataTransfer.getData("text/plain");
    if (tag && ELEMENT_DEFINITIONS[tag]) dropElement(tag);
  });
}