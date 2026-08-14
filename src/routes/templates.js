import { Router } from "express";

const router = Router();

const TEMPLATES = {
  blank: {
    tag: "div", attrs: {}, children: []
  },
  landing: {
    tag: "div", attrs: { style: "font-family:system-ui,sans-serif" },
    children: [
      {
        tag: "section",
        attrs: { "data-nc-id": "hero", style: "padding:80px 40px;text-align:center;background:linear-gradient(135deg,#667eea,#764ba2);color:white;" },
        children: [
          { tag: "h1", attrs: { style: "font-size:3rem;font-weight:700;margin:0 0 16px" }, children: [{ type: "text", content: "Build Something Amazing" }] },
          { tag: "p",  attrs: { style: "font-size:1.2rem;opacity:0.9;max-width:560px;margin:0 auto 32px" }, children: [{ type: "text", content: "Your tagline goes here." }] },
          { tag: "button", attrs: { style: "padding:14px 32px;background:white;color:#7c3aed;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer" }, children: [{ type: "text", content: "Get Started" }] },
        ]
      },
      {
        tag: "section",
        attrs: { "data-nc-id": "features", style: "padding:64px 40px;background:#f9fafb;" },
        children: [
          { tag: "h2", attrs: { style: "text-align:center;font-size:2rem;font-weight:700;margin-bottom:40px;color:#111827" }, children: [{ type: "text", content: "Features" }] },
          { tag: "div", attrs: { style: "display:grid;grid-template-columns:repeat(3,1fr);gap:32px;max-width:960px;margin:0 auto" }, children: [
            { tag: "div", attrs: { style: "background:white;padding:32px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1)" }, children: [{ tag: "h3", attrs: {}, children: [{ type: "text", content: "Feature One" }] }] },
            { tag: "div", attrs: { style: "background:white;padding:32px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1)" }, children: [{ tag: "h3", attrs: {}, children: [{ type: "text", content: "Feature Two" }] }] },
            { tag: "div", attrs: { style: "background:white;padding:32px;border-radius:12px;box-shadow:0 1px 3px rgba(0,0,0,0.1)" }, children: [{ tag: "h3", attrs: {}, children: [{ type: "text", content: "Feature Three" }] }] },
          ]}
        ]
      }
    ]
  },
  contact: {
    tag: "div", attrs: { style: "font-family:system-ui,sans-serif;padding:64px 40px;max-width:560px;margin:0 auto" },
    children: [
      { tag: "h1", attrs: { style: "font-size:2rem;font-weight:700;margin-bottom:8px" }, children: [{ type: "text", content: "Contact Us" }] },
      { tag: "p",  attrs: { style: "color:#6b7280;margin-bottom:32px" }, children: [{ type: "text", content: "We'll get back to you within 24 hours." }] },
      {
        tag: "form",
        attrs: {
          "data-nc-id": "contact-form",
          style: "display:flex;flex-direction:column;gap:16px",
          "hx-post": "/api/contact",
          "hx-target": "#form-result",
          "hx-swap": "innerHTML"
        },
        children: [
          { tag: "input", attrs: { type: "text", name: "name", placeholder: "Your name", style: "padding:12px;border:1px solid #d1d5db;border-radius:8px;font-size:1rem" } },
          { tag: "input", attrs: { type: "email", name: "email", placeholder: "Email address", style: "padding:12px;border:1px solid #d1d5db;border-radius:8px;font-size:1rem" } },
          { tag: "textarea", attrs: { name: "message", rows: "5", placeholder: "Your message", style: "padding:12px;border:1px solid #d1d5db;border-radius:8px;font-size:1rem;resize:vertical" }, children: [] },
          { tag: "button", attrs: { type: "submit", style: "padding:12px;background:#7c3aed;color:white;border:none;border-radius:8px;font-size:1rem;font-weight:600;cursor:pointer" }, children: [{ type: "text", content: "Send Message" }] },
        ]
      },
      { tag: "div", attrs: { id: "form-result", style: "margin-top:16px" }, children: [] }
    ]
  }
};

// GET /api/templates/:id/canvas
router.get("/:id/canvas", (req, res) => {
  const canvas = TEMPLATES[req.params.id] || TEMPLATES.blank;
  res.json({ canvas });
});

export default router;