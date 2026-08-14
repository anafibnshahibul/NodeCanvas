import mongoose from "mongoose";

const PageSchema = new mongoose.Schema(
  {
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true, index: true },
    name:      { type: String, required: true, default: "Untitled Page" },
    slug:      { type: String, required: true, default: "index" },  // used as filename: index.html, about.html
    order:     { type: Number, default: 0 },
    canvas:    { type: mongoose.Schema.Types.Mixed, default: {} },  // the full JSON tree
    meta: {
      title:       { type: String, default: "" },
      description: { type: String, default: "" },
      ogImage:     { type: String, default: "" },
      customCSS:   { type: String, default: "" },
      customJS:    { type: String, default: "" },
    },
    isHomepage: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Enforce unique slug per project
PageSchema.index({ projectId: 1, slug: 1 }, { unique: true });

export const Page = mongoose.model("Page", PageSchema);