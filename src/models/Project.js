import mongoose from "mongoose";

const ProjectSchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true, default: "Untitled Project" },
    slug:        { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    userId:      { type: String, index: true },
    pages:       [{ type: mongoose.Schema.Types.ObjectId, ref: "Page" }],  // ordered page refs
    thumbnail:   { type: String, default: "" },
    isPublished: { type: Boolean, default: false },
    // Global settings shared across all pages
    globalMeta: {
      favicon:     { type: String, default: "" },
      lang:        { type: String, default: "en" },
      globalCSS:   { type: String, default: "" },    // injected into every page
      globalJS:    { type: String, default: "" },
      customHTML:  { type: String, default: "" },    // <head> injection
    },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

ProjectSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") + "-" + Date.now().toString(36);
  }
  next();
});

export const Project = mongoose.model("Project", ProjectSchema);