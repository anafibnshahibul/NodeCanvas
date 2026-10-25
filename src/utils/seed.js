import { Projects, Pages, Templates } from "../db/jsonDb.js";
import { FULL_STACK_TEMPLATES } from "./templatesData.js";

export async function seedDefaultData() {
  // 1. Seed Templates
  const templateCount = await Templates.countDocuments();
  if (templateCount === 0) {
    for (const tmpl of FULL_STACK_TEMPLATES) {
      await Templates.create(tmpl);
    }
    console.log(`  ✓ Seeded ${FULL_STACK_TEMPLATES.length} full-stack templates into JSON database`);
  }

  // 2. Seed Default Project if none exists
  const projectCount = await Projects.countDocuments();
  if (projectCount === 0) {
    const defaultTmpl = FULL_STACK_TEMPLATES.find(t => t.id === "saas") || FULL_STACK_TEMPLATES[0];
    const project = await Projects.create({
      name: "Nebula AI — SaaS Platform",
      slug: "nebula-ai-saas",
      thumbnail: "/assets/templates/saas.svg",
      isPublished: true,
      globalMeta: {
        lang: "en",
        favicon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>⚡</text></svg>",
        globalCSS: "/* Custom theme styling */\n::selection { background: #7c3aed; color: #ffffff; }",
        globalJS: "console.log('Nebula AI loaded successfully');",
        customHTML: "<meta name='theme-color' content='#7c3aed'/>"
      },
      pages: []
    });

    const homePage = await Pages.create({
      projectId: project.id,
      name: "Home",
      slug: "index",
      order: 0,
      isHomepage: true,
      canvas: defaultTmpl.canvas,
      meta: {
        title: "Nebula AI — Modern Intelligent Cloud Platform",
        description: "Transform your development workflow with next-generation autonomous AI capabilities.",
      }
    });

    // Also add a Contact & Pricing page for full-stack multi-page demonstration
    const contactTmpl = FULL_STACK_TEMPLATES.find(t => t.id === "contact") || FULL_STACK_TEMPLATES[1];
    const contactPage = await Pages.create({
      projectId: project.id,
      name: "Contact & Pricing",
      slug: "contact",
      order: 1,
      isHomepage: false,
      canvas: contactTmpl.canvas,
      meta: {
        title: "Contact Us & Plans — Nebula AI",
        description: "Get in touch with the team or discover our flexible subscription plans.",
      }
    });

    await Projects.findByIdAndUpdate(project.id, {
      pages: [homePage.id, contactPage.id]
    });

    console.log("  ✓ Seeded default showcase project with Home and Contact pages");
  }
}
