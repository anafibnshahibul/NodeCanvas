/**
 * exportService.js — Core export engine.
 *
 * Converts the project's stored JSON canvas tree into:
 *   1. Static ZIP  → index.html + style.css + script.js
 *   2. WordPress   → theme folder with PHP templates + style.css + functions.php
 *   3. JSON dump   → raw project JSON
 */

import path     from "path";
import fs       from "fs/promises";
import archiver from "archiver";
import { v4 as uuidv4 } from "uuid";

const EXPORT_DIR = process.env.EXPORT_DIR || "./exports";

// ── Entry point: route to correct exporter ────────────────────────────────
export async function exportProject(project, format) {
  await fs.mkdir(EXPORT_DIR, { recursive: true });
  switch (format) {
    case "static":    return exportStatic(project);
    case "wordpress": return exportWordPress(project);
    case "json":      return exportJSON(project);
    default:          throw new Error(`Unknown export format: ${format}`);
  }
}

// ══════════════════════════════════════════════════════════════════════════════
// 1. STATIC HTML/CSS/JS EXPORT
// ══════════════════════════════════════════════════════════════════════════════
async function exportStatic(project) {
  const id       = uuidv4();
  const outDir   = path.join(EXPORT_DIR, id);
  const zipPath  = path.join(EXPORT_DIR, `${project.slug || "export"}-${id}.zip`);

  await fs.mkdir(outDir, { recursive: true });

  const html = buildStaticHTML(project);
  const css  = buildStaticCSS(project);
  const js   = buildStaticJS(project);

  await Promise.all([
    fs.writeFile(path.join(outDir, "index.html"), html),
    fs.writeFile(path.join(outDir, "style.css"),  css),
    fs.writeFile(path.join(outDir, "script.js"),  js),
  ]);

  await zipDirectory(outDir, zipPath);
  await fs.rm(outDir, { recursive: true }); // cleanup temp dir

  return zipPath;
}

function buildStaticHTML(project) {
  const bodyHTML = renderNodeToHTML(project.canvas);
  const meta = project.meta || {};

  return `<!DOCTYPE html>
<html lang="${meta.lang || "en"}">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="description" content="${meta.description || ""}" />
  <title>${meta.title || project.name || "My Website"}</title>
  <link rel="stylesheet" href="style.css" />
  ${meta.customCSS ? `<style>${meta.customCSS}</style>` : ""}
</head>
<body>
${bodyHTML}
${buildHTMXScript(project)}
${buildAnimObserver(project)}
${meta.customJS ? `<script>\n${meta.customJS}\n</script>` : ""}
<script src="script.js"></script>
</body>
</html>`;
}

function buildStaticCSS(project) {
  const rules = collectCSSRules(project.canvas);
  const animations = `
/* NodeCanvas Animation Presets */
@keyframes fadeIn       { from { opacity: 0 }             to { opacity: 1 } }
@keyframes slideInLeft  { from { transform: translateX(-40px); opacity: 0 } to { transform: translateX(0); opacity: 1 } }
@keyframes slideInRight { from { transform: translateX(40px);  opacity: 0 } to { transform: translateX(0); opacity: 1 } }
@keyframes slideInUp    { from { transform: translateY(40px);  opacity: 0 } to { transform: translateY(0); opacity: 1 } }
@keyframes slideInDown  { from { transform: translateY(-40px); opacity: 0 } to { transform: translateY(0); opacity: 1 } }
@keyframes zoomIn       { from { transform: scale(0.8);  opacity: 0 }       to { transform: scale(1);   opacity: 1 } }
@keyframes bounce       { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-16px) } }
@keyframes pulse        { 0%,100% { opacity: 1 } 50% { opacity: 0.5 } }
@keyframes shake        { 0%,100% { transform: translateX(0) } 20%,60% { transform: translateX(-6px) } 40%,80% { transform: translateX(6px) } }

/* Base reset */
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: system-ui, sans-serif; }
img  { max-width: 100%; display: block; }
`;
  return animations + "\n" + rules;
}

/** Walk the canvas tree and extract inline styles → named classes */
function collectCSSRules(node, rules = [], idMap = new Map()) {
  if (!node || node.type === "text") return rules;
  const id = node.attrs?.["data-nc-id"];
  if (id && node.attrs?.style) {
    const className = `nc-${id}`;
    rules.push(`.${className} { ${node.attrs.style} }`);
    idMap.set(id, className);
  }
  (node.children || []).forEach(child => collectCSSRules(child, rules, idMap));
  return rules.join("\n");
}

function buildStaticJS(project) {
  const conditionals = collectConditionalScripts(project.canvas, []).join("\n");
  return `/* NodeCanvas — Generated script.js */
document.addEventListener("DOMContentLoaded", function() {
  ${conditionals}
});`;
}

function collectConditionalScripts(node, scripts) {
  if (!node || node.type === "text") return scripts;
  if (node.attrs?.["data-nc-conditional-script"]) {
    scripts.push(node.attrs["data-nc-conditional-script"]);
  }
  (node.children || []).forEach(c => collectConditionalScripts(c, scripts));
  return scripts;
}

/** Inject HTMX only if project uses any hx-* attributes */
function buildHTMXScript(project) {
  const usesHTMX = JSON.stringify(project.canvas).includes("hx-");
  if (!usesHTMX) return "";
  return `<script src="https://unpkg.com/htmx.org@2.0.3/dist/htmx.min.js"></script>`;
}

/** Intersection Observer for scroll-triggered animations */
function buildAnimObserver(project) {
  const usesScrollAnim = JSON.stringify(project.canvas).includes("nc-anim-scroll");
  if (!usesScrollAnim) return "";
  return `
<script>
(function() {
  var obs = new IntersectionObserver(function(entries) {
    entries.forEach(function(e) {
      if (e.isIntersecting) {
        e.target.style.opacity = "1";
        var cls = e.target.dataset.ncAnimClass;
        if (cls) e.target.classList.add(cls);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll("[data-nc-anim-scroll]").forEach(function(el) {
    obs.observe(el);
  });
})();
</script>`;
}

// ── Recursive JSON node → clean HTML string ───────────────────────────────
function renderNodeToHTML(node, indent = 0) {
  if (!node) return "";
  if (node.type === "text") return node.content || "";

  const pad     = "  ".repeat(indent);
  const tag     = node.tag;
  const attrs   = buildAttrString(node.attrs || {});
  const voids   = new Set(["img","input","br","hr","meta","link","area","base","col","embed","param","source","track","wbr"]);

  if (voids.has(tag)) {
    return `${pad}<${tag}${attrs} />\n`;
  }

  const children = (node.children || [])
    .map(child => renderNodeToHTML(child, indent + 1))
    .join("");

  return `${pad}<${tag}${attrs}>\n${children}${pad}</${tag}>\n`;
}

function buildAttrString(attrs) {
  // Strip builder-only attributes
  const STRIP = new Set(["data-nc-id","data-nc-tag","data-nc-container","data-nc-conditional-script","data-nc-anim-trigger"]);
  return Object.entries(attrs)
    .filter(([k]) => !STRIP.has(k))
    .map(([k, v]) => ` ${k}="${v.replace(/"/g, "&quot;")}"`)
    .join("");
}

// ══════════════════════════════════════════════════════════════════════════════
// 2. WORDPRESS THEME EXPORT
// ══════════════════════════════════════════════════════════════════════════════
async function exportWordPress(project) {
  const id        = uuidv4();
  const themeName = (project.slug || "nodecanvas-theme").replace(/\s+/g, "-").toLowerCase();
  const themeDir  = path.join(EXPORT_DIR, id, themeName);
  const zipPath   = path.join(EXPORT_DIR, `${themeName}-${id}.zip`);

  await fs.mkdir(themeDir, { recursive: true });

  const files = {
    "style.css":       buildWPStyleCSS(project, themeName),
    "functions.php":   buildWPFunctions(project),
    "index.php":       buildWPIndexPHP(project),
    "header.php":      buildWPHeaderPHP(project),
    "footer.php":      buildWPFooterPHP(project),
    "page.php":        buildWPPagePHP(project),
    "single.php":      buildWPSinglePHP(),
    "404.php":         buildWP404PHP(),
    "screenshot.png":  null, // placeholder; real implementation would generate one
  };

  await Promise.all(
    Object.entries(files)
      .filter(([, content]) => content !== null)
      .map(([filename, content]) =>
        fs.writeFile(path.join(themeDir, filename), content)
      )
  );

  await zipDirectory(path.join(EXPORT_DIR, id), zipPath);
  await fs.rm(path.join(EXPORT_DIR, id), { recursive: true });

  return zipPath;
}

function buildWPStyleCSS(project, themeName) {
  const meta = project.meta || {};
  return `/*
Theme Name: ${project.name || themeName}
Description: ${meta.description || "Generated by NodeCanvas Builder"}
Version: 1.0.0
Author: NodeCanvas
*/

${buildStaticCSS(project)}
`;
}

function buildWPFunctions(project) {
  const usesHTMX = JSON.stringify(project.canvas).includes("hx-");
  return `<?php
/**
 * ${project.name || "NodeCanvas Theme"} functions.php
 * Generated by NodeCanvas Builder
 */

function nc_theme_setup() {
  add_theme_support('title-tag');
  add_theme_support('post-thumbnails');
  add_theme_support('html5', ['search-form','comment-form','comment-list','gallery','caption']);
  register_nav_menus(['primary' => __('Primary Menu', 'nc-theme')]);
}
add_action('after_setup_theme', 'nc_theme_setup');

function nc_enqueue_scripts() {
  wp_enqueue_style('nc-style', get_stylesheet_uri(), [], '1.0.0');
${usesHTMX ? "  wp_enqueue_script('htmx', 'https://unpkg.com/htmx.org@2.0.3/dist/htmx.min.js', [], '2.0.3', true);" : ""}
  wp_enqueue_script('nc-script', get_template_directory_uri() . '/script.js', [], '1.0.0', true);
}
add_action('wp_enqueue_scripts', 'nc_enqueue_scripts');

/** HTMX-compatible form handler (replaces JS-only fetch) */
function nc_handle_form_submission() {
  if (!isset($_POST['nc_form_nonce']) || !wp_verify_nonce($_POST['nc_form_nonce'], 'nc_form')) {
    wp_send_json_error('Invalid nonce', 403);
  }
  // Add your custom form handling logic here
  $data = array_map('sanitize_text_field', $_POST);
  wp_send_json_success(['message' => 'Form submitted successfully', 'data' => $data]);
}
add_action('wp_ajax_nc_form', 'nc_handle_form_submission');
add_action('wp_ajax_nopriv_nc_form', 'nc_handle_form_submission');
`;
}

function buildWPHeaderPHP(project) {
  const meta = project.meta || {};
  return `<?php
/**
 * Header template — NodeCanvas
 */
?><!DOCTYPE html>
<html <?php language_attributes(); ?> class="h-full">
<head>
  <meta charset="<?php bloginfo('charset'); ?>">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
`;
}

function buildWPFooterPHP(project) {
  return `<?php
/**
 * Footer template — NodeCanvas
 */
?>
<?php wp_footer(); ?>
</body>
</html>
`;
}

function buildWPIndexPHP(project) {
  const bodyHTML = renderNodeToHTML(project.canvas);
  return `<?php get_header(); ?>
<main id="nc-main">
${bodyHTML}
</main>
<?php get_footer(); ?>
`;
}

function buildWPPagePHP(project) {
  return `<?php get_header(); ?>
<main id="nc-main">
  <?php while (have_posts()) : the_post(); ?>
    <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
      <h1 class="page-title"><?php the_title(); ?></h1>
      <div class="page-content"><?php the_content(); ?></div>
    </article>
  <?php endwhile; ?>
</main>
<?php get_footer(); ?>
`;
}

function buildWPSinglePHP() {
  return `<?php get_header(); ?>
<main id="nc-main">
  <?php while (have_posts()) : the_post(); ?>
    <article id="post-<?php the_ID(); ?>" <?php post_class(); ?>>
      <h1><?php the_title(); ?></h1>
      <div class="entry-content"><?php the_content(); ?></div>
    </article>
  <?php endwhile; ?>
</main>
<?php get_footer(); ?>
`;
}

function buildWP404PHP() {
  return `<?php get_header(); ?>
<main><h1>404 — Page Not Found</h1><p><?php esc_html_e('The page you are looking for could not be found.', 'nc-theme'); ?></p></main>
<?php get_footer(); ?>
`;
}

// ══════════════════════════════════════════════════════════════════════════════
// 3. JSON EXPORT
// ══════════════════════════════════════════════════════════════════════════════
async function exportJSON(project) {
  const id      = uuidv4();
  const outPath = path.join(EXPORT_DIR, `${project.slug || "project"}-${id}.json`);
  await fs.writeFile(outPath, JSON.stringify(project, null, 2));
  return outPath;
}

// ── Zip helper ────────────────────────────────────────────────────────────
function zipDirectory(sourceDir, outPath) {
  return new Promise((resolve, reject) => {
    const output  = require("fs").createWriteStream(outPath);
    const archive = archiver("zip", { zlib: { level: 9 } });
    output.on("close", resolve);
    archive.on("error", reject);
    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}