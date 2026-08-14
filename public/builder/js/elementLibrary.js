import { dropElement, dropRawHTML } from "./canvas.js";

// ── Element Definitions ───────────────────────────────────────────────────
export const ELEMENT_DEFINITIONS = {

  // ════════════ LAYOUT ════════════
  div: {
    label:"Container", group:"layout",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>`,
    isContainer:true,
    defaultStyle:{ display:"block", minHeight:"80px", padding:"16px" }
  },
  section: {
    label:"Section", group:"layout",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 9h20"/></svg>`,
    isContainer:true,
    defaultStyle:{ display:"block", padding:"60px 40px", minHeight:"120px" }
  },
  header: {
    label:"Header", group:"layout",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="7" rx="2"/><rect x="2" y="14" width="20" height="7" rx="2" opacity=".3"/></svg>`,
    isContainer:true,
    defaultStyle:{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"16px 32px", backgroundColor:"#ffffff", boxShadow:"0 1px 3px rgba(0,0,0,.1)" }
  },
  footer: {
    label:"Footer", group:"layout",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="7" rx="2" opacity=".3"/><rect x="2" y="14" width="20" height="7" rx="2"/></svg>`,
    isContainer:true,
    defaultStyle:{ display:"block", padding:"48px 40px 24px", backgroundColor:"#111827", color:"#f9fafb" }
  },
  nav: {
    label:"Navbar", group:"layout",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 6h18M3 12h12M3 18h8" stroke-linecap="round"/></svg>`,
    isContainer:true,
    defaultStyle:{ display:"flex", alignItems:"center", gap:"32px", padding:"14px 32px", backgroundColor:"#ffffff", borderBottom:"1px solid #e5e7eb" }
  },
  main: {
    label:"Main", group:"layout",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="20" height="20" rx="2"/><path d="M7 8h10M7 12h10M7 16h6"/></svg>`,
    isContainer:true,
    defaultStyle:{ display:"block", padding:"32px", minHeight:"300px" }
  },
  article: {
    label:"Article", group:"layout",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 10h16M4 14h10M4 18h8" stroke-linecap="round"/></svg>`,
    isContainer:true,
    defaultStyle:{ display:"block", padding:"40px", maxWidth:"760px", margin:"0 auto", lineHeight:"1.8" }
  },
  aside: {
    label:"Sidebar", group:"layout",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="7" height="18" rx="1"/><rect x="11" y="3" width="11" height="18" rx="1"/></svg>`,
    isContainer:true,
    defaultStyle:{ display:"block", width:"280px", padding:"24px", backgroundColor:"#f9fafb", borderRight:"1px solid #e5e7eb" }
  },
  // Flex row
  "div-row": {
    label:"Flex Row", group:"layout",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="5" height="10" rx="1"/><rect x="9.5" y="7" width="5" height="10" rx="1"/><rect x="17" y="7" width="5" height="10" rx="1"/></svg>`,
    isContainer:true,
    defaultStyle:{ display:"flex", flexDirection:"row", gap:"24px", padding:"16px", flexWrap:"wrap" }
  },
  // Grid
  "div-grid": {
    label:"Grid", group:"layout",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="9" height="9" rx="1"/><rect x="13" y="2" width="9" height="9" rx="1"/><rect x="2" y="13" width="9" height="9" rx="1"/><rect x="13" y="13" width="9" height="9" rx="1"/></svg>`,
    isContainer:true,
    defaultStyle:{ display:"grid", gridTemplateColumns:"repeat(3, 1fr)", gap:"24px", padding:"16px" }
  },

  // ════════════ TYPOGRAPHY ════════════
  h1: {
    label:"Heading 1", group:"typography",
    icon:`<svg viewBox="0 0 24 24" fill="currentColor"><text x="2" y="18" font-size="16" font-weight="900">H1</text></svg>`,
    defaultText:"Main Heading",
    defaultStyle:{ fontSize:"3rem", fontWeight:"800", lineHeight:"1.15", letterSpacing:"-0.02em", color:"#111827", margin:"0 0 16px" }
  },
  h2: {
    label:"Heading 2", group:"typography",
    icon:`<svg viewBox="0 0 24 24" fill="currentColor"><text x="2" y="18" font-size="14" font-weight="800">H2</text></svg>`,
    defaultText:"Section Heading",
    defaultStyle:{ fontSize:"2.25rem", fontWeight:"700", lineHeight:"1.2", letterSpacing:"-0.015em", color:"#111827", margin:"0 0 12px" }
  },
  h3: {
    label:"Heading 3", group:"typography",
    icon:`<svg viewBox="0 0 24 24" fill="currentColor"><text x="2" y="18" font-size="13" font-weight="700">H3</text></svg>`,
    defaultText:"Sub Heading",
    defaultStyle:{ fontSize:"1.75rem", fontWeight:"600", lineHeight:"1.3", color:"#111827" }
  },
  h4: {
    label:"Heading 4", group:"typography",
    icon:`<svg viewBox="0 0 24 24" fill="currentColor"><text x="2" y="18" font-size="12" font-weight="700">H4</text></svg>`,
    defaultText:"Card Title",
    defaultStyle:{ fontSize:"1.25rem", fontWeight:"600", color:"#111827" }
  },
  h5: {
    label:"Heading 5", group:"typography",
    icon:`<svg viewBox="0 0 24 24" fill="currentColor"><text x="2" y="18" font-size="11" font-weight="700">H5</text></svg>`,
    defaultText:"Small Title",
    defaultStyle:{ fontSize:"1.1rem", fontWeight:"600", color:"#374151" }
  },
  h6: {
    label:"Heading 6", group:"typography",
    icon:`<svg viewBox="0 0 24 24" fill="currentColor"><text x="2" y="18" font-size="10" font-weight="700">H6</text></svg>`,
    defaultText:"Label",
    defaultStyle:{ fontSize:"0.9rem", fontWeight:"600", color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.06em" }
  },
  p: {
    label:"Paragraph", group:"typography",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 6h16M4 10h16M4 14h16M4 18h10" stroke-linecap="round"/></svg>`,
    defaultText:"This is a paragraph. Write your content here to engage your visitors.",
    defaultStyle:{ fontSize:"1rem", lineHeight:"1.75", color:"#374151", margin:"0 0 16px" }
  },
  span: {
    label:"Span", group:"typography",
    icon:`<svg viewBox="0 0 24 24" fill="currentColor"><text x="2" y="18" font-size="12">ab</text></svg>`,
    defaultText:"Inline text"
  },
  a: {
    label:"Link", group:"typography",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
    defaultText:"Click here",
    defaultAttrs:{ href:"#" },
    defaultStyle:{ color:"#7c3aed", textDecoration:"underline", fontWeight:"500" }
  },
  blockquote: {
    label:"Blockquote", group:"typography",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1zm12 0c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>`,
    defaultText:"The best way to predict the future is to invent it.",
    defaultStyle:{ borderLeft:"4px solid #7c3aed", padding:"20px 24px", backgroundColor:"#faf5ff", color:"#4b5563", fontStyle:"italic", fontSize:"1.1rem", lineHeight:"1.7", borderRadius:"0 8px 8px 0", margin:"24px 0" }
  },
  ul: {
    label:"Bullet List", group:"typography",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke-linecap="round"/></svg>`,
    isContainer:true,
    defaultHTML:`<li style="padding:4px 0;color:#374151">First list item</li><li style="padding:4px 0;color:#374151">Second list item</li><li style="padding:4px 0;color:#374151">Third list item</li>`,
    defaultStyle:{ paddingLeft:"24px", lineHeight:"1.8" }
  },
  ol: {
    label:"Numbered List", group:"typography",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M10 6h11M10 12h11M10 18h11" stroke-linecap="round"/><path d="M3 7V5l-1 1M3 13H2l1-1.5a.7.7 0 00-1.3-.5M3 17h-1v2h2" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    isContainer:true,
    defaultHTML:`<li style="padding:4px 0;color:#374151">First item</li><li style="padding:4px 0;color:#374151">Second item</li><li style="padding:4px 0;color:#374151">Third item</li>`,
    defaultStyle:{ paddingLeft:"24px", lineHeight:"1.8" }
  },
  // Badge/tag
  "span-badge": {
    label:"Badge", group:"typography",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="10" rx="5"/></svg>`,
    defaultText:"New",
    defaultStyle:{ display:"inline-block", padding:"3px 12px", backgroundColor:"#ede9fe", color:"#7c3aed", fontSize:"0.75rem", fontWeight:"600", borderRadius:"9999px", letterSpacing:"0.03em" }
  },

  // ════════════ MEDIA ════════════
  img: {
    label:"Image", group:"media",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5" fill="currentColor"/><path d="M21 15l-5-5L5 21" stroke-linecap="round"/></svg>`,
    defaultAttrs:{ src:"https://placehold.co/800x500/e2e8f0/94a3b8?text=Image", alt:"", loading:"lazy" },
    defaultStyle:{ maxWidth:"100%", height:"auto", display:"block", borderRadius:"8px" }
  },
  video: {
    label:"Video", group:"media",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z"/></svg>`,
    defaultAttrs:{ controls:"", src:"" },
    defaultStyle:{ width:"100%", height:"auto", display:"block", borderRadius:"8px" }
  },
  iframe: {
    label:"Embed / iFrame", group:"media",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M2 8h20M8 21V8"/></svg>`,
    defaultAttrs:{ src:"https://www.youtube.com/embed/dQw4w9WgXcQ", frameborder:"0", allowfullscreen:"", loading:"lazy" },
    defaultStyle:{ width:"100%", height:"360px", border:"none", borderRadius:"8px" }
  },
  hr: {
    label:"Divider", group:"media",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18" stroke-linecap="round"/></svg>`,
    defaultStyle:{ border:"none", borderTop:"2px solid #e5e7eb", margin:"32px 0" }
  },
  // Avatar
  "div-avatar": {
    label:"Avatar", group:"media",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>`,
    isContainer:true,
    defaultHTML:`<img src="https://i.pravatar.cc/80" alt="Avatar" style="width:100%;height:100%;object-fit:cover"/>`,
    defaultStyle:{ width:"64px", height:"64px", borderRadius:"50%", overflow:"hidden", border:"3px solid #e5e7eb" }
  },
  // SVG Icon placeholder
  "div-icon": {
    label:"Icon Box", group:"media",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    isContainer:true,
    defaultHTML:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:100%;height:100%"><path stroke-linecap="round" stroke-linejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>`,
    defaultStyle:{ width:"56px", height:"56px", padding:"12px", backgroundColor:"#ede9fe", borderRadius:"12px", color:"#7c3aed" }
  },
  // Progress bar
  "div-progress": {
    label:"Progress Bar", group:"media",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="9" width="20" height="6" rx="3"/><rect x="2" y="9" width="13" height="6" rx="3" fill="currentColor" opacity=".5"/></svg>`,
    isContainer:true,
    defaultHTML:`
<div style="display:flex;justify-content:space-between;margin-bottom:6px">
  <span style="font-size:13px;font-weight:500;color:#374151">Progress</span>
  <span style="font-size:13px;color:#7c3aed;font-weight:600">70%</span>
</div>
<div style="background:#e5e7eb;border-radius:9999px;height:8px;overflow:hidden">
  <div style="width:70%;height:100%;background:linear-gradient(90deg,#7c3aed,#a855f7);border-radius:9999px;transition:width 1s ease"></div>
</div>`,
    defaultStyle:{ padding:"8px 0" }
  },

  // ════════════ FORMS ════════════
  form: {
    label:"Form", group:"forms",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 9h20M7 4v5"/></svg>`,
    isContainer:true,
    defaultStyle:{ display:"flex", flexDirection:"column", gap:"16px", padding:"32px", maxWidth:"520px" }
  },
  input: {
    label:"Text Input", group:"forms",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M6 12h2" stroke-linecap="round"/></svg>`,
    defaultAttrs:{ type:"text", placeholder:"Enter text…", name:"field" },
    defaultStyle:{ padding:"10px 14px", border:"1.5px solid #d1d5db", borderRadius:"8px", fontSize:"1rem", width:"100%", outline:"none", transition:"border-color .2s", fontFamily:"inherit" }
  },
  textarea: {
    label:"Textarea", group:"forms",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M7 8h10M7 12h10M7 16h6" stroke-linecap="round"/></svg>`,
    defaultAttrs:{ placeholder:"Write your message…", rows:"4", name:"message" },
    defaultStyle:{ padding:"10px 14px", border:"1.5px solid #d1d5db", borderRadius:"8px", fontSize:"1rem", width:"100%", resize:"vertical", fontFamily:"inherit" }
  },
  select: {
    label:"Dropdown", group:"forms",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="7" width="20" height="10" rx="2"/><path d="M7 17l5 5 5-5" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    defaultHTML:`<option value="">Choose an option</option><option value="1">Option One</option><option value="2">Option Two</option><option value="3">Option Three</option>`,
    defaultAttrs:{ name:"select" },
    defaultStyle:{ padding:"10px 14px", border:"1.5px solid #d1d5db", borderRadius:"8px", fontSize:"1rem", width:"100%", backgroundColor:"#fff", fontFamily:"inherit" }
  },
  button: {
    label:"Button", group:"forms",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="20" height="12" rx="6"/></svg>`,
    defaultText:"Get Started",
    defaultAttrs:{ type:"button" },
    defaultStyle:{ display:"inline-flex", alignItems:"center", justifyContent:"center", padding:"11px 28px", backgroundColor:"#7c3aed", color:"#fff", border:"none", borderRadius:"8px", fontSize:"1rem", fontWeight:"600", cursor:"pointer", transition:"all .2s", letterSpacing:"0.01em", fontFamily:"inherit" }
  },
  // Checkbox
  "label-checkbox": {
    label:"Checkbox", group:"forms",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 12l4 4 6-7" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    defaultHTML:`<input type="checkbox" id="cb1" style="width:18px;height:18px;accent-color:#7c3aed;margin-right:10px;cursor:pointer">
<label for="cb1" style="font-size:14px;color:#374151;cursor:pointer">I agree to the terms and conditions</label>`,
    defaultStyle:{ display:"flex", alignItems:"center" }
  },
  // Radio group
  "div-radio": {
    label:"Radio Group", group:"forms",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="4" fill="currentColor"/></svg>`,
    isContainer:true,
    defaultHTML:`<label style="display:flex;align-items:center;gap:10px;font-size:14px;color:#374151;margin-bottom:10px;cursor:pointer"><input type="radio" name="rb1" value="a" style="width:16px;height:16px;accent-color:#7c3aed"> Option A</label>
<label style="display:flex;align-items:center;gap:10px;font-size:14px;color:#374151;margin-bottom:10px;cursor:pointer"><input type="radio" name="rb1" value="b" style="width:16px;height:16px;accent-color:#7c3aed"> Option B</label>
<label style="display:flex;align-items:center;gap:10px;font-size:14px;color:#374151;cursor:pointer"><input type="radio" name="rb1" value="c" style="width:16px;height:16px;accent-color:#7c3aed"> Option C</label>`
  },
  // Range slider
  "input-range": {
    label:"Range Slider", group:"forms",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 12h20M8 7l-4 5 4 5" stroke-linecap="round" stroke-linejoin="round"/><circle cx="12" cy="12" r="3" fill="currentColor" opacity=".3"/></svg>`,
    defaultAttrs:{ type:"range", min:"0", max:"100", value:"50" },
    defaultStyle:{ width:"100%", accentColor:"#7c3aed" }
  },
  label: {
    label:"Label", group:"forms",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><path d="M7 7h.01"/></svg>`,
    defaultText:"Field Label",
    defaultStyle:{ display:"block", fontSize:"14px", fontWeight:"500", color:"#374151", marginBottom:"6px" }
  },

  // ════════════ INTERACTIVE (HTMX) ════════════
  "button-htmx": {
    label:"HTMX Button", group:"interactive",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="6" width="20" height="12" rx="6"/><path d="M8 12h8M14 9l3 3-3 3" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    defaultText:"Load Data",
    defaultAttrs:{ "hx-get":"/api/data", "hx-target":"#result", "hx-swap":"innerHTML", type:"button" },
    defaultStyle:{ display:"inline-flex", alignItems:"center", gap:"8px", padding:"10px 24px", backgroundColor:"#0f172a", color:"#fff", border:"none", borderRadius:"8px", fontSize:"14px", fontWeight:"600", cursor:"pointer", fontFamily:"inherit" }
  },
  "div-result": {
    label:"Result Target", group:"interactive",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2" stroke-dasharray="4 2"/><path d="M12 8v8M8 12h8" stroke-linecap="round"/></svg>`,
    isContainer:true,
    defaultHTML:`<p style="color:#9ca3af;font-size:13px;text-align:center;padding:24px">Results will appear here</p>`,
    defaultStyle:{ minHeight:"60px", border:"2px dashed #e5e7eb", borderRadius:"8px" }
  },
  "form-search": {
    label:"Live Search", group:"interactive",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>`,
    isContainer:true,
    defaultHTML:`<div style="position:relative">
  <svg style="position:absolute;left:12px;top:50%;transform:translateY(-50%);width:16px;height:16px;color:#9ca3af" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35" stroke-linecap="round"/></svg>
  <input type="search" name="q" placeholder="Search…" hx-get="/api/search" hx-target="#search-results" hx-trigger="keyup changed delay:300ms" style="width:100%;padding:11px 14px 11px 40px;border:1.5px solid #d1d5db;border-radius:8px;font-size:14px;outline:none;font-family:inherit"/>
</div>
<div id="search-results" style="margin-top:12px;min-height:40px"></div>`
  },

  // ════════════ 3D & CANVAS ════════════
  "canvas-3d": {
    label:"3D Canvas", group:"threed",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
    isContainer:false,
    defaultHTML:`<canvas id="canvas3d" style="width:100%;height:400px;display:block;border-radius:8px;background:#0a0a0a"></canvas>
<script>
(function(){
  var c=document.getElementById("canvas3d");
  if(!c)return;
  c.width=c.offsetWidth;c.height=400;
  var ctx=c.getContext("2d");
  var t=0;
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    ctx.fillStyle="#0a0a0a";ctx.fillRect(0,0,c.width,c.height);
    var cx=c.width/2,cy=c.height/2,r=80;
    for(var i=0;i<8;i++){
      var a=i/8*Math.PI*2+t;
      var x=cx+Math.cos(a)*r,y=cy+Math.sin(a)*r*0.4;
      var s=0.5+0.5*(Math.sin(a)*0.5+0.5);
      ctx.beginPath();ctx.arc(x,y,12*s,0,Math.PI*2);
      ctx.fillStyle="rgba(124,58,237,"+(0.4+0.6*s)+")";ctx.fill();
    }
    ctx.beginPath();ctx.arc(cx,cy,20,0,Math.PI*2);
    ctx.fillStyle="#a855f7";ctx.fill();
    t+=0.02;requestAnimationFrame(draw);
  }
  draw();
})();
</script>`,
    defaultStyle:{ display:"block" }
  },
  "canvas-particles": {
    label:"Particles BG", group:"threed",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="6" cy="6" r="2" fill="currentColor"/><circle cx="18" cy="6" r="1.5" fill="currentColor" opacity=".6"/><circle cx="12" cy="12" r="2.5" fill="currentColor" opacity=".8"/><circle cx="6" cy="18" r="1" fill="currentColor" opacity=".4"/><circle cx="18" cy="18" r="2" fill="currentColor" opacity=".7"/></svg>`,
    defaultHTML:`<div style="position:relative;width:100%;height:300px;background:#0f1117;border-radius:12px;overflow:hidden">
  <canvas id="ptx" style="position:absolute;inset:0;width:100%;height:100%"></canvas>
  <div style="position:relative;z-index:1;display:flex;align-items:center;justify-content:center;height:100%;flex-direction:column;color:#fff;text-align:center;padding:24px">
    <h2 style="font-size:2rem;font-weight:700;margin:0 0 8px">Hero Title</h2>
    <p style="color:rgba(255,255,255,.6);margin:0">Your subtitle goes here</p>
  </div>
</div>
<script>
(function(){
  var c=document.getElementById("ptx");if(!c)return;
  var ctx=c.getContext("2d"),pts=[];
  function resize(){c.width=c.offsetWidth;c.height=c.offsetHeight;}
  resize();window.addEventListener("resize",resize);
  for(var i=0;i<60;i++) pts.push({x:Math.random()*c.width,y:Math.random()*c.height,vx:(Math.random()-.5)*.4,vy:(Math.random()-.5)*.4,r:Math.random()*2+1});
  function draw(){
    ctx.clearRect(0,0,c.width,c.height);
    pts.forEach(function(p){
      p.x+=p.vx;p.y+=p.vy;
      if(p.x<0||p.x>c.width)p.vx*=-1;
      if(p.y<0||p.y>c.height)p.vy*=-1;
      ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle="rgba(167,139,250,.7)";ctx.fill();
    });
    pts.forEach(function(a,i){pts.slice(i+1).forEach(function(b){
      var d=Math.hypot(a.x-b.x,a.y-b.y);
      if(d<100){ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);
      ctx.strokeStyle="rgba(167,139,250,"+(1-d/100)*0.25+")";ctx.stroke();}
    });});
    requestAnimationFrame(draw);
  }
  draw();
})();
</script>`,
    defaultStyle:{ display:"block" }
  },

  // ════════════ BUILT-IN SECTIONS ════════════
  "section-hero": {
    label:"Hero Section", group:"sections",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M8 9h8M8 13h5M6 17h4"/></svg>`,
    isContainer:true,
    defaultHTML:`
<div style="display:flex;flex-direction:column;align-items:center;text-align:center;padding:100px 40px;background:linear-gradient(135deg,#1e1b4b 0%,#312e81 50%,#4c1d95 100%);color:#fff;min-height:600px;justify-content:center;position:relative;overflow:hidden">
  <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 50%,rgba(124,58,237,.3),transparent 70%)"></div>
  <div style="position:relative;z-index:1;max-width:760px">
    <span style="display:inline-block;padding:6px 16px;background:rgba(167,139,250,.2);color:#c4b5fd;border:1px solid rgba(167,139,250,.3);border-radius:99px;font-size:13px;font-weight:600;letter-spacing:.05em;margin-bottom:24px">✨ Introducing NodeCanvas</span>
    <h1 style="font-size:clamp(2.5rem,6vw,4.5rem);font-weight:900;line-height:1.1;letter-spacing:-0.02em;margin:0 0 24px">Build Websites<br><span style="background:linear-gradient(90deg,#a78bfa,#ec4899);-webkit-background-clip:text;-webkit-text-fill-color:transparent">Visually Fast</span></h1>
    <p style="font-size:1.2rem;color:rgba(255,255,255,.7);max-width:520px;margin:0 auto 40px;line-height:1.7">The professional drag-and-drop website builder for modern teams. No code required.</p>
    <div style="display:flex;gap:16px;justify-content:center;flex-wrap:wrap">
      <button type="button" style="padding:14px 32px;background:#7c3aed;color:#fff;border:none;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer;letter-spacing:.01em;box-shadow:0 0 40px rgba(124,58,237,.5)">Start Building →</button>
      <button type="button" style="padding:14px 32px;background:rgba(255,255,255,.1);color:#fff;border:1px solid rgba(255,255,255,.2);border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;backdrop-filter:blur(10px)">Watch Demo</button>
    </div>
  </div>
</div>`
  },
  "section-features": {
    label:"Features Grid", group:"sections",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="2" width="9" height="9" rx="1.5"/><rect x="13" y="2" width="9" height="9" rx="1.5"/><rect x="2" y="13" width="9" height="9" rx="1.5"/><rect x="13" y="13" width="9" height="9" rx="1.5"/></svg>`,
    isContainer:true,
    defaultHTML:`
<div style="padding:80px 40px;background:#fff">
  <div style="text-align:center;max-width:600px;margin:0 auto 64px">
    <span style="display:inline-block;font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px">Features</span>
    <h2 style="font-size:2.5rem;font-weight:800;color:#111827;margin:0 0 16px;line-height:1.2">Everything you need</h2>
    <p style="color:#6b7280;font-size:1.1rem;line-height:1.7;margin:0">Powerful tools designed for professionals who want speed without sacrificing quality.</p>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:32px;max-width:1100px;margin:0 auto">
    <div style="padding:32px;border-radius:16px;border:1.5px solid #f3f4f6;transition:all .2s">
      <div style="width:48px;height:48px;background:#ede9fe;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:22px">⚡</div>
      <h3 style="font-size:1.1rem;font-weight:700;color:#111827;margin:0 0 10px">Lightning Fast</h3>
      <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0">Built for performance from the ground up with modern web standards.</p>
    </div>
    <div style="padding:32px;border-radius:16px;border:1.5px solid #f3f4f6">
      <div style="width:48px;height:48px;background:#dbeafe;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:22px">🎨</div>
      <h3 style="font-size:1.1rem;font-weight:700;color:#111827;margin:0 0 10px">Beautiful Design</h3>
      <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0">Professional templates and components to make your site stand out.</p>
    </div>
    <div style="padding:32px;border-radius:16px;border:1.5px solid #f3f4f6">
      <div style="width:48px;height:48px;background:#dcfce7;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:22px">🔒</div>
      <h3 style="font-size:1.1rem;font-weight:700;color:#111827;margin:0 0 10px">Secure & Reliable</h3>
      <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0">Enterprise-grade security with 99.9% uptime guarantee for peace of mind.</p>
    </div>
    <div style="padding:32px;border-radius:16px;border:1.5px solid #f3f4f6">
      <div style="width:48px;height:48px;background:#fef3c7;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:22px">📱</div>
      <h3 style="font-size:1.1rem;font-weight:700;color:#111827;margin:0 0 10px">Mobile First</h3>
      <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0">Every component is fully responsive and tested on all device sizes.</p>
    </div>
    <div style="padding:32px;border-radius:16px;border:1.5px solid #f3f4f6">
      <div style="width:48px;height:48px;background:#fce7f3;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:22px">🔌</div>
      <h3 style="font-size:1.1rem;font-weight:700;color:#111827;margin:0 0 10px">Integrations</h3>
      <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0">Connect to 100+ tools including Stripe, Mailchimp, and Zapier.</p>
    </div>
    <div style="padding:32px;border-radius:16px;border:1.5px solid #f3f4f6">
      <div style="width:48px;height:48px;background:#e0f2fe;border-radius:12px;display:flex;align-items:center;justify-content:center;margin-bottom:20px;font-size:22px">📊</div>
      <h3 style="font-size:1.1rem;font-weight:700;color:#111827;margin:0 0 10px">Analytics</h3>
      <p style="color:#6b7280;font-size:14px;line-height:1.7;margin:0">Built-in analytics to track your visitors, conversions and growth.</p>
    </div>
  </div>
</div>`
  },
  "section-pricing": {
    label:"Pricing Table", group:"sections",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="3" width="20" height="18" rx="2"/><path d="M12 8v4M12 16h.01M8 3v4M16 3v4"/></svg>`,
    isContainer:true,
    defaultHTML:`
<div style="padding:80px 40px;background:#f9fafb">
  <div style="text-align:center;max-width:560px;margin:0 auto 64px">
    <span style="display:inline-block;font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px">Pricing</span>
    <h2 style="font-size:2.5rem;font-weight:800;color:#111827;margin:0 0 16px">Simple, transparent pricing</h2>
    <p style="color:#6b7280;font-size:1rem;margin:0">No hidden fees. Cancel anytime.</p>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1000px;margin:0 auto;align-items:start">
    <!-- Free -->
    <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:20px;padding:36px 32px">
      <h3 style="font-size:1.1rem;font-weight:700;color:#374151;margin:0 0 8px">Starter</h3>
      <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:8px">
        <span style="font-size:2.5rem;font-weight:900;color:#111827">$0</span>
        <span style="color:#9ca3af;font-size:14px">/mo</span>
      </div>
      <p style="color:#6b7280;font-size:13px;margin:0 0 28px">Perfect for personal projects</p>
      <ul style="list-style:none;padding:0;margin:0 0 32px;display:flex;flex-direction:column;gap:12px">
        <li style="font-size:14px;color:#374151;display:flex;align-items:center;gap:10px"><span style="color:#10b981;font-weight:700">✓</span> 3 projects</li>
        <li style="font-size:14px;color:#374151;display:flex;align-items:center;gap:10px"><span style="color:#10b981;font-weight:700">✓</span> 1GB storage</li>
        <li style="font-size:14px;color:#9ca3af;display:flex;align-items:center;gap:10px"><span>✗</span> Custom domain</li>
        <li style="font-size:14px;color:#9ca3af;display:flex;align-items:center;gap:10px"><span>✗</span> Priority support</li>
      </ul>
      <button type="button" style="width:100%;padding:12px;background:#f3f4f6;color:#374151;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer">Get Started</button>
    </div>
    <!-- Pro — highlighted -->
    <div style="background:linear-gradient(145deg,#4c1d95,#7c3aed);border-radius:20px;padding:36px 32px;position:relative;box-shadow:0 20px 60px rgba(124,58,237,.4);transform:scale(1.04)">
      <div style="position:absolute;top:-12px;left:50%;transform:translateX(-50%);background:#f59e0b;color:#fff;font-size:11px;font-weight:700;padding:4px 16px;border-radius:99px;white-space:nowrap">MOST POPULAR</div>
      <h3 style="font-size:1.1rem;font-weight:700;color:rgba(255,255,255,.8);margin:0 0 8px">Pro</h3>
      <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:8px">
        <span style="font-size:2.5rem;font-weight:900;color:#fff">$29</span>
        <span style="color:rgba(255,255,255,.6);font-size:14px">/mo</span>
      </div>
      <p style="color:rgba(255,255,255,.6);font-size:13px;margin:0 0 28px">For growing businesses</p>
      <ul style="list-style:none;padding:0;margin:0 0 32px;display:flex;flex-direction:column;gap:12px">
        <li style="font-size:14px;color:#fff;display:flex;align-items:center;gap:10px"><span style="color:#34d399;font-weight:700">✓</span> Unlimited projects</li>
        <li style="font-size:14px;color:#fff;display:flex;align-items:center;gap:10px"><span style="color:#34d399;font-weight:700">✓</span> 20GB storage</li>
        <li style="font-size:14px;color:#fff;display:flex;align-items:center;gap:10px"><span style="color:#34d399;font-weight:700">✓</span> Custom domain</li>
        <li style="font-size:14px;color:#fff;display:flex;align-items:center;gap:10px"><span style="color:#34d399;font-weight:700">✓</span> Priority support</li>
      </ul>
      <button type="button" style="width:100%;padding:12px;background:#fff;color:#7c3aed;border:none;border-radius:10px;font-size:15px;font-weight:700;cursor:pointer;box-shadow:0 4px 14px rgba(0,0,0,.2)">Start Free Trial</button>
    </div>
    <!-- Enterprise -->
    <div style="background:#fff;border:1.5px solid #e5e7eb;border-radius:20px;padding:36px 32px">
      <h3 style="font-size:1.1rem;font-weight:700;color:#374151;margin:0 0 8px">Enterprise</h3>
      <div style="display:flex;align-items:baseline;gap:4px;margin-bottom:8px">
        <span style="font-size:2.5rem;font-weight:900;color:#111827">$99</span>
        <span style="color:#9ca3af;font-size:14px">/mo</span>
      </div>
      <p style="color:#6b7280;font-size:13px;margin:0 0 28px">For large organizations</p>
      <ul style="list-style:none;padding:0;margin:0 0 32px;display:flex;flex-direction:column;gap:12px">
        <li style="font-size:14px;color:#374151;display:flex;align-items:center;gap:10px"><span style="color:#10b981;font-weight:700">✓</span> Everything in Pro</li>
        <li style="font-size:14px;color:#374151;display:flex;align-items:center;gap:10px"><span style="color:#10b981;font-weight:700">✓</span> Unlimited storage</li>
        <li style="font-size:14px;color:#374151;display:flex;align-items:center;gap:10px"><span style="color:#10b981;font-weight:700">✓</span> SLA guarantee</li>
        <li style="font-size:14px;color:#374151;display:flex;align-items:center;gap:10px"><span style="color:#10b981;font-weight:700">✓</span> Dedicated manager</li>
      </ul>
      <button type="button" style="width:100%;padding:12px;background:#f3f4f6;color:#374151;border:none;border-radius:10px;font-size:15px;font-weight:600;cursor:pointer">Contact Sales</button>
    </div>
  </div>
</div>`
  },
  "section-testimonials": {
    label:"Testimonials", group:"sections",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2v10z"/></svg>`,
    isContainer:true,
    defaultHTML:`
<div style="padding:80px 40px;background:#fff">
  <div style="text-align:center;margin-bottom:56px">
    <span style="display:inline-block;font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px">Testimonials</span>
    <h2 style="font-size:2.25rem;font-weight:800;color:#111827;margin:0">Loved by thousands</h2>
  </div>
  <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;max-width:1100px;margin:0 auto">
    <div style="padding:32px;background:#f9fafb;border-radius:16px;border:1px solid #f3f4f6">
      <div style="display:flex;gap:4px;margin-bottom:16px">★★★★★</div>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px">"NodeCanvas completely transformed how we build websites. What used to take weeks now takes hours."</p>
      <div style="display:flex;align-items:center;gap:12px">
        <img src="https://i.pravatar.cc/40?img=1" alt="" style="width:40px;height:40px;border-radius:50%"/>
        <div><p style="font-size:14px;font-weight:600;color:#111827;margin:0">Sarah Johnson</p><p style="font-size:12px;color:#6b7280;margin:0">CTO, TechCorp</p></div>
      </div>
    </div>
    <div style="padding:32px;background:#f9fafb;border-radius:16px;border:1px solid #f3f4f6">
      <div style="display:flex;gap:4px;margin-bottom:16px">★★★★★</div>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px">"The best website builder I've used. Clean output, zero bloat, and the WordPress export is perfect."</p>
      <div style="display:flex;align-items:center;gap:12px">
        <img src="https://i.pravatar.cc/40?img=8" alt="" style="width:40px;height:40px;border-radius:50%"/>
        <div><p style="font-size:14px;font-weight:600;color:#111827;margin:0">Marcus Lee</p><p style="font-size:12px;color:#6b7280;margin:0">Freelancer</p></div>
      </div>
    </div>
    <div style="padding:32px;background:#f9fafb;border-radius:16px;border:1px solid #f3f4f6">
      <div style="display:flex;gap:4px;margin-bottom:16px">★★★★★</div>
      <p style="color:#374151;font-size:15px;line-height:1.7;margin:0 0 24px">"Our agency shipped 12 client sites last month alone. The multipage support is a game changer."</p>
      <div style="display:flex;align-items:center;gap:12px">
        <img src="https://i.pravatar.cc/40?img=5" alt="" style="width:40px;height:40px;border-radius:50%"/>
        <div><p style="font-size:14px;font-weight:600;color:#111827;margin:0">Priya Mehta</p><p style="font-size:12px;color:#6b7280;margin:0">Agency Owner</p></div>
      </div>
    </div>
  </div>
</div>`
  },
  "section-cta": {
    label:"CTA Section", group:"sections",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M13 10V3L4 14h7v7l9-11h-7z" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
    isContainer:true,
    defaultHTML:`
<div style="padding:80px 40px;background:linear-gradient(135deg,#7c3aed,#4f46e5);text-align:center">
  <h2 style="font-size:2.75rem;font-weight:900;color:#fff;margin:0 0 16px;line-height:1.15">Ready to get started?</h2>
  <p style="color:rgba(255,255,255,.8);font-size:1.1rem;margin:0 auto 40px;max-width:480px;line-height:1.6">Join 10,000+ builders who create stunning websites with NodeCanvas every day.</p>
  <div style="display:flex;gap:16px;justify-content:center">
    <button type="button" style="padding:14px 36px;background:#fff;color:#7c3aed;border:none;border-radius:10px;font-size:16px;font-weight:700;cursor:pointer">Start for Free</button>
    <button type="button" style="padding:14px 36px;background:rgba(255,255,255,.15);color:#fff;border:1px solid rgba(255,255,255,.3);border-radius:10px;font-size:16px;font-weight:600;cursor:pointer;backdrop-filter:blur(8px)">See Plans</button>
  </div>
</div>`
  },
  "section-contact": {
    label:"Contact Form", group:"sections",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/></svg>`,
    isContainer:true,
    defaultHTML:`
<div style="padding:80px 40px;background:#fff">
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:80px;max-width:1000px;margin:0 auto;align-items:center">
    <div>
      <span style="display:inline-block;font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px">Contact</span>
      <h2 style="font-size:2.5rem;font-weight:800;color:#111827;margin:0 0 16px;line-height:1.2">Get in touch</h2>
      <p style="color:#6b7280;line-height:1.7;margin:0 0 32px">We'd love to hear from you. Send us a message and we'll respond within 24 hours.</p>
      <div style="display:flex;flex-direction:column;gap:20px">
        <div style="display:flex;align-items:center;gap:16px"><div style="width:44px;height:44px;background:#ede9fe;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">📧</div><div><p style="font-weight:600;color:#111827;margin:0;font-size:14px">Email</p><p style="color:#6b7280;margin:0;font-size:14px">hello@nodecanvas.dev</p></div></div>
        <div style="display:flex;align-items:center;gap:16px"><div style="width:44px;height:44px;background:#dbeafe;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0">📍</div><div><p style="font-weight:600;color:#111827;margin:0;font-size:14px">Location</p><p style="color:#6b7280;margin:0;font-size:14px">Dhaka, Bangladesh</p></div></div>
      </div>
    </div>
    <form style="display:flex;flex-direction:column;gap:16px" hx-post="/api/contact" hx-target="#contact-result" hx-swap="innerHTML">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
        <div><label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px">First Name</label><input type="text" name="fname" placeholder="John" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;outline:none;font-family:inherit;box-sizing:border-box"/></div>
        <div><label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px">Last Name</label><input type="text" name="lname" placeholder="Doe" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;outline:none;font-family:inherit;box-sizing:border-box"/></div>
      </div>
      <div><label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px">Email</label><input type="email" name="email" placeholder="john@example.com" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;outline:none;font-family:inherit;box-sizing:border-box"/></div>
      <div><label style="display:block;font-size:13px;font-weight:500;color:#374151;margin-bottom:6px">Message</label><textarea name="message" rows="4" placeholder="How can we help you?" style="width:100%;padding:10px 14px;border:1.5px solid #e5e7eb;border-radius:8px;font-size:14px;outline:none;resize:vertical;font-family:inherit;box-sizing:border-box"></textarea></div>
      <button type="submit" style="padding:12px;background:#7c3aed;color:#fff;border:none;border-radius:8px;font-size:15px;font-weight:600;cursor:pointer;font-family:inherit">Send Message →</button>
      <div id="contact-result"></div>
    </form>
  </div>
</div>`
  },
  "section-stats": {
    label:"Stats / Numbers", group:"sections",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>`,
    isContainer:true,
    defaultHTML:`
<div style="padding:60px 40px;background:#0f172a">
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:32px;max-width:1000px;margin:0 auto;text-align:center">
    <div><div style="font-size:3rem;font-weight:900;color:#a78bfa;line-height:1">10K+</div><div style="color:rgba(255,255,255,.6);font-size:14px;margin-top:8px">Happy users</div></div>
    <div><div style="font-size:3rem;font-weight:900;color:#34d399;line-height:1">50K+</div><div style="color:rgba(255,255,255,.6);font-size:14px;margin-top:8px">Sites built</div></div>
    <div><div style="font-size:3rem;font-weight:900;color:#60a5fa;line-height:1">99.9%</div><div style="color:rgba(255,255,255,.6);font-size:14px;margin-top:8px">Uptime SLA</div></div>
    <div><div style="font-size:3rem;font-weight:900;color:#f59e0b;line-height:1">4.9★</div><div style="color:rgba(255,255,255,.6);font-size:14px;margin-top:8px">Average rating</div></div>
  </div>
</div>`
  },
  "section-faq": {
    label:"FAQ Section", group:"sections",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3M12 17h.01" stroke-linecap="round"/></svg>`,
    isContainer:true,
    defaultHTML:`
<div style="padding:80px 40px;background:#f9fafb">
  <div style="max-width:720px;margin:0 auto">
    <div style="text-align:center;margin-bottom:56px">
      <span style="display:inline-block;font-size:12px;font-weight:700;color:#7c3aed;text-transform:uppercase;letter-spacing:.1em;margin-bottom:12px">FAQ</span>
      <h2 style="font-size:2.25rem;font-weight:800;color:#111827;margin:0">Frequently asked questions</h2>
    </div>
    <div style="display:flex;flex-direction:column;gap:16px">
      <details style="background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;padding:20px 24px" open>
        <summary style="font-weight:600;color:#111827;cursor:pointer;font-size:15px;list-style:none;display:flex;justify-content:space-between;align-items:center">Do I need to know how to code? <span style="color:#7c3aed;font-size:18px">+</span></summary>
        <p style="color:#6b7280;margin:12px 0 0;font-size:14px;line-height:1.7">Not at all! NodeCanvas is built for everyone — from beginners to seasoned developers. Our visual editor handles all the complexity for you.</p>
      </details>
      <details style="background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;padding:20px 24px">
        <summary style="font-weight:600;color:#111827;cursor:pointer;font-size:15px;list-style:none;display:flex;justify-content:space-between;align-items:center">Can I export my site? <span style="color:#7c3aed;font-size:18px">+</span></summary>
        <p style="color:#6b7280;margin:12px 0 0;font-size:14px;line-height:1.7">Yes! Export as clean HTML/CSS/JS, a WordPress theme, or raw JSON. Your site is always yours.</p>
      </details>
      <details style="background:#fff;border:1.5px solid #e5e7eb;border-radius:12px;padding:20px 24px">
        <summary style="font-weight:600;color:#111827;cursor:pointer;font-size:15px;list-style:none;display:flex;justify-content:space-between;align-items:center">Is there a free plan? <span style="color:#7c3aed;font-size:18px">+</span></summary>
        <p style="color:#6b7280;margin:12px 0 0;font-size:14px;line-height:1.7">Absolutely! The Starter plan is free forever with 3 projects and 1GB of storage.</p>
      </details>
    </div>
  </div>
</div>`
  },
  "section-navbar": {
    label:"Navigation Bar", group:"sections",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="5" width="20" height="5" rx="2"/><path d="M6 8h1M10 8h5M18 8h1"/></svg>`,
    isContainer:true,
    defaultHTML:`
<nav style="display:flex;align-items:center;justify-content:space-between;padding:16px 40px;background:#fff;border-bottom:1px solid #e5e7eb;position:sticky;top:0;z-index:100;box-shadow:0 1px 3px rgba(0,0,0,.05)">
  <div style="display:flex;align-items:center;gap:8px">
    <div style="width:32px;height:32px;background:#7c3aed;border-radius:8px;display:flex;align-items:center;justify-content:center">
      <svg viewBox="0 0 24 24" fill="white" style="width:16px;height:16px"><path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg>
    </div>
    <span style="font-size:16px;font-weight:700;color:#111827">Brand</span>
  </div>
  <div style="display:flex;align-items:center;gap:32px">
    <a href="#" style="color:#6b7280;text-decoration:none;font-size:14px;font-weight:500;transition:color .2s">Home</a>
    <a href="#" style="color:#6b7280;text-decoration:none;font-size:14px;font-weight:500">Features</a>
    <a href="#" style="color:#6b7280;text-decoration:none;font-size:14px;font-weight:500">Pricing</a>
    <a href="#" style="color:#6b7280;text-decoration:none;font-size:14px;font-weight:500">Blog</a>
  </div>
  <div style="display:flex;align-items:center;gap:12px">
    <a href="#" style="color:#374151;text-decoration:none;font-size:14px;font-weight:600">Log in</a>
    <a href="#" style="padding:9px 20px;background:#7c3aed;color:#fff;text-decoration:none;border-radius:8px;font-size:14px;font-weight:600">Sign up</a>
  </div>
</nav>`
  },
  "section-footer": {
    label:"Footer", group:"sections",
    icon:`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="2" y="16" width="20" height="6" rx="2"/><path d="M6 16v-4M12 16V8M18 16v-4"/></svg>`,
    isContainer:true,
    defaultHTML:`
<footer style="background:#0f172a;color:#f9fafb;padding:64px 40px 32px">
  <div style="max-width:1100px;margin:0 auto">
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr;gap:48px;margin-bottom:48px">
      <div>
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
          <div style="width:32px;height:32px;background:#7c3aed;border-radius:8px;display:flex;align-items:center;justify-content:center"><svg viewBox="0 0 24 24" fill="white" style="width:16px;height:16px"><path d="M4 5a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1V5zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 15a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H5a1 1 0 01-1-1v-4zm10 0a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z"/></svg></div>
          <span style="font-weight:700;font-size:16px">NodeCanvas</span>
        </div>
        <p style="color:#94a3b8;font-size:14px;line-height:1.7;margin:0 0 20px;max-width:280px">The professional website builder for modern teams. Build fast, export anywhere.</p>
      </div>
      <div>
        <p style="font-weight:600;margin:0 0 16px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8">Product</p>
        <div style="display:flex;flex-direction:column;gap:10px"><a href="#" style="color:#e2e8f0;text-decoration:none;font-size:14px">Features</a><a href="#" style="color:#e2e8f0;text-decoration:none;font-size:14px">Pricing</a><a href="#" style="color:#e2e8f0;text-decoration:none;font-size:14px">Templates</a></div>
      </div>
      <div>
        <p style="font-weight:600;margin:0 0 16px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8">Company</p>
        <div style="display:flex;flex-direction:column;gap:10px"><a href="#" style="color:#e2e8f0;text-decoration:none;font-size:14px">About</a><a href="#" style="color:#e2e8f0;text-decoration:none;font-size:14px">Blog</a><a href="#" style="color:#e2e8f0;text-decoration:none;font-size:14px">Careers</a></div>
      </div>
      <div>
        <p style="font-weight:600;margin:0 0 16px;font-size:13px;text-transform:uppercase;letter-spacing:.06em;color:#94a3b8">Legal</p>
        <div style="display:flex;flex-direction:column;gap:10px"><a href="#" style="color:#e2e8f0;text-decoration:none;font-size:14px">Privacy</a><a href="#" style="color:#e2e8f0;text-decoration:none;font-size:14px">Terms</a></div>
      </div>
    </div>
    <div style="border-top:1px solid rgba(255,255,255,.06);padding-top:24px;display:flex;justify-content:space-between;align-items:center">
      <p style="color:#64748b;font-size:13px;margin:0">© 2026 NodeCanvas. All rights reserved.</p>
      <p style="color:#64748b;font-size:13px;margin:0">Made with ❤️ in Dhaka</p>
    </div>
  </div>
</footer>`
  },
};

// ── Group definitions ─────────────────────────────────────────────────────
export const GROUPS = [
  { id:"sections",    label:"⚡ Quick Sections", color:"#7c3aed" },
  { id:"layout",      label:"Layout",            color:"#2563eb" },
  { id:"typography",  label:"Typography",         color:"#059669" },
  { id:"media",       label:"Media",              color:"#d97706" },
  { id:"forms",       label:"Forms",              color:"#dc2626" },
  { id:"interactive", label:"Interactive (HTMX)", color:"#7c3aed" },
  { id:"threed",      label:"3D & Canvas",        color:"#6366f1" },
];

// ── Render sidebar ────────────────────────────────────────────────────────
export function renderElementLibrary() {
  const root = document.getElementById("element-groups");
  if (!root) return;
  root.innerHTML = "";

  GROUPS.forEach(group => {
    const groupEl = document.createElement("div");
    groupEl.className = "element-group";
    groupEl.dataset.group = group.id;

    const header = document.createElement("button");
    header.className = "element-group-header";
    header.innerHTML = `
      <span style="display:flex;align-items:center;gap:8px">
        <span style="width:6px;height:6px;border-radius:50%;background:${group.color};flex-shrink:0"></span>
        <span>${group.label}</span>
      </span>
      <svg class="group-chevron" style="width:12px;height:12px;transition:transform .2s" viewBox="0 0 12 12" fill="none">
        <path d="M2 4l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>`;

    const grid = document.createElement("div");
    grid.className = "element-grid";
    grid.id = `grp-${group.id}`;
    if (group.id === "sections") grid.style.gridTemplateColumns = "1fr";

    // Collapse toggle
    header.addEventListener("click", () => {
      const collapsed = grid.style.display === "none";
      grid.style.display = collapsed ? "" : "none";
      header.querySelector(".group-chevron").style.transform = collapsed ? "" : "rotate(-90deg)";
    });

    groupEl.appendChild(header);
    groupEl.appendChild(grid);
    root.appendChild(groupEl);
  });

  // Populate elements
  Object.entries(ELEMENT_DEFINITIONS).forEach(([tag, def]) => {
    const grid = document.getElementById(`grp-${def.group}`);
    if (!grid) return;

    const tile = document.createElement("div");
    tile.className = "element-tile";
    tile.draggable = true;
    tile.dataset.tag = tag;
    tile.dataset.label = def.label.toLowerCase();

    if (def.group === "sections") {
      // Full-width section tile
      tile.style.cssText = `display:flex;align-items:center;gap:12px;padding:12px 14px;cursor:pointer;
        border-radius:10px;border:1.5px solid rgba(255,255,255,.06);background:#12141f;
        transition:all .15s;user-select:none`;
      tile.innerHTML = `
        <div style="width:36px;height:36px;background:linear-gradient(135deg,rgba(124,58,237,.3),rgba(99,102,241,.2));border-radius:8px;display:flex;align-items:center;justify-content:center;flex-shrink:0;color:#a78bfa">
          ${def.icon}
        </div>
        <div>
          <div style="font-size:12px;font-weight:600;color:#e5e7eb">${def.label}</div>
          <div style="font-size:10px;color:#6b7280;margin-top:1px">Full section block</div>
        </div>
        <div style="margin-left:auto;color:#6b7280;font-size:16px">+</div>`;
      tile.addEventListener("mouseenter", () => { tile.style.borderColor = "rgba(124,58,237,.5)"; tile.style.background = "rgba(124,58,237,.08)"; });
      tile.addEventListener("mouseleave", () => { tile.style.borderColor = "rgba(255,255,255,.06)"; tile.style.background = "#12141f"; });
    } else {
      // Regular 2-col tile
      tile.innerHTML = `
        <div style="width:32px;height:32px;color:#9ca3af;flex-shrink:0">${def.icon}</div>
        <span style="font-size:10px;color:#9ca3af;text-align:center;line-height:1.3;margin-top:4px">${def.label}</span>`;
    }

    tile.addEventListener("click", () => dropElement(tag));
    tile.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", tag);
      e.dataTransfer.effectAllowed = "copy";
    });
    grid.appendChild(tile);
  });

  // Canvas drop handlers
  const canvas = document.getElementById("canvas");
  canvas.addEventListener("dragover",  e => { e.preventDefault(); canvas.classList.add("nc-drop-active"); });
  canvas.addEventListener("dragleave", ()=> canvas.classList.remove("nc-drop-active"));
  canvas.addEventListener("drop",      e => {
    e.preventDefault();
    canvas.classList.remove("nc-drop-active");
    const tag = e.dataTransfer.getData("text/plain");
    if (tag && ELEMENT_DEFINITIONS[tag]) dropElement(tag);
  });
}

// ── Search ────────────────────────────────────────────────────────────────
window.filterElements = function(q) {
  q = q.toLowerCase();
  document.querySelectorAll(".element-tile").forEach(tile => {
    const match = !q || (tile.dataset.label || "").includes(q);
    tile.style.display = match ? "" : "none";
  });
  // Show/hide group headers based on visible tiles
  document.querySelectorAll(".element-group").forEach(grp => {
    const anyVisible = [...grp.querySelectorAll(".element-tile")].some(t => t.style.display !== "none");
    grp.style.display = anyVisible ? "" : "none";
  });
};