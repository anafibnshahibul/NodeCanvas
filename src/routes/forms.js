import { Router } from "express";
import { Submission } from "../models/Submission.js";

const router = Router();

// POST /api/forms/submit & POST /api/contact — generic form submission handler
const handleFormSubmission = async (req, res, next) => {
  try {
    const rawData = { ...req.body };
    const formName = rawData.formName || "General Form";
    const projectId = rawData.projectId || "general";
    const sourcePage = req.headers.referer || "";
    const ip = req.ip || req.socket.remoteAddress || "127.0.0.1";

    // Clean internal fields from data payload
    delete rawData.formName;
    delete rawData.projectId;

    // Basic sanitization
    const sanitizedData = {};
    for (const [k, v] of Object.entries(rawData)) {
      if (typeof v === "string") {
        sanitizedData[k] = v.trim().slice(0, 5000); // prevent flood
      } else {
        sanitizedData[k] = v;
      }
    }

    const submission = await Submission.create({
      projectId,
      formName,
      data: sanitizedData,
      sourcePage,
      ip,
      createdAt: new Date().toISOString()
    });

    const isHTMX = req.headers["hx-request"] === "true";
    if (isHTMX) {
      return res.send(`
        <div class="nc-form-success" style="padding:16px 20px;background:#059669;color:#ffffff;border-radius:10px;display:flex;align-items:center;gap:12px;box-shadow:0 10px 25px -5px rgba(5,150,105,0.4);animation:fadeIn 0.3s ease;">
          <svg style="width:24px;height:24px;flex-shrink:0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <div>
            <div style="font-weight:700;font-size:14px;">Submission Received!</div>
            <div style="font-size:12px;opacity:0.9;">Thank you. Your message has been safely recorded.</div>
          </div>
        </div>
      `);
    }

    res.status(201).json({
      success: true,
      message: "Form submitted successfully",
      submissionId: submission.id
    });
  } catch (err) {
    next(err);
  }
};

router.post("/submit", handleFormSubmission);
router.post("/contact", handleFormSubmission);

// GET /api/forms/submissions/:projectId — list submissions for project
router.get("/submissions/:projectId", async (req, res, next) => {
  try {
    const list = await Submission.find({ projectId: req.params.projectId });
    res.json({ submissions: list });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/forms/submissions/:id — delete submission
router.delete("/submissions/:id", async (req, res, next) => {
  try {
    await Submission.findByIdAndDelete(req.params.id);
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
