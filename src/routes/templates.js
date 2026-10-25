import { Router } from "express";
import { FULL_STACK_TEMPLATES } from "../utils/templatesData.js";
import { Project } from "../models/Project.js";
import { Page } from "../models/Page.js";

const router = Router();

// GET /api/templates — list all available templates
router.get("/", (req, res) => {
  const templates = FULL_STACK_TEMPLATES.map(t => ({
    id: t.id,
    name: t.name,
    category: t.category,
    description: t.description,
    thumbnail: t.thumbnail,
    badge: t.badge,
    gradient: t.gradient,
  }));
  res.json({ templates });
});

// GET /api/templates/:id/canvas — get canvas for template
router.get("/:id/canvas", (req, res) => {
  const found = FULL_STACK_TEMPLATES.find(t => t.id === req.params.id);
  const canvas = found?.canvas || FULL_STACK_TEMPLATES[0].canvas;
  res.json({ canvas, template: found || FULL_STACK_TEMPLATES[0] });
});

// POST /api/templates/:id/instantiate — clone template into a brand new project
router.post("/:id/instantiate", async (req, res, next) => {
  try {
    const template = FULL_STACK_TEMPLATES.find(t => t.id === req.params.id) || FULL_STACK_TEMPLATES[0];
    const projectName = req.body.name || `${template.name} Site`;

    const project = await Project.create({
      name: projectName,
      thumbnail: template.thumbnail,
      globalMeta: {
        lang: "en",
        favicon: "",
        globalCSS: "",
        globalJS: "",
        customHTML: ""
      }
    });

    const homePage = await Page.create({
      projectId: project.id,
      name: "Home",
      slug: "index",
      order: 0,
      isHomepage: true,
      canvas: template.canvas,
      meta: {
        title: `${projectName} — Home`,
        description: template.description
      }
    });

    // If template has additional pages or contact, add them
    if (template.id !== "blank" && template.id !== "contact") {
      const contactTmpl = FULL_STACK_TEMPLATES.find(t => t.id === "contact");
      if (contactTmpl) {
        const contactPage = await Page.create({
          projectId: project.id,
          name: "Contact",
          slug: "contact",
          order: 1,
          isHomepage: false,
          canvas: contactTmpl.canvas,
          meta: {
            title: `Contact — ${projectName}`,
            description: "Get in touch with us"
          }
        });
        project.pages = [homePage.id, contactPage.id];
      } else {
        project.pages = [homePage.id];
      }
    } else {
      project.pages = [homePage.id];
    }

    await project.save();

    res.status(201).json({
      success: true,
      projectId: project.id,
      homePageId: homePage.id,
      redirectUrl: `/builder/editor/${project.id}/${homePage.id}`
    });
  } catch (err) {
    next(err);
  }
});

export default router;