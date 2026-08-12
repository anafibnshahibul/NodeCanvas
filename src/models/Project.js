/**
 * Project.js — Mongoose model.
 * Each project stores the full canvas JSON tree, project metadata,
 * and custom code injection strings.
 *
 * To use PostgreSQL instead: see the commented Sequelize equivalent below.
 */

import mongoose from "mongoose";

// ── Canvas Node (recursive) ───────────────────────────────────────────────
const CanvasNodeSchema = new mongoose.Schema(
  {
    type:     { type: String, default: "element" },   // "element" | "text"
    tag:      { type: String },                       // "div", "p", "h1" …
    content:  { type: String },                       // text node content
    attrs:    { type: mongoose.Schema.Types.Mixed },  // { style, id, class, hx-* … }
    children: { type: Array, default: [] },           // recursive CanvasNode[]
  },
  { _id: false }
);

// ── Project Meta ─────────────────────────────────────────────────────────
const MetaSchema = new mongoose.Schema(
  {
    title:       { type: String, default: "" },
    description: { type: String, default: "" },
    lang:        { type: String, default: "en" },
    favicon:     { type: String, default: "" },
    ogImage:     { type: String, default: "" },
    // Custom code injection
    customCSS:   { type: String, default: "" },
    customJS:    { type: String, default: "" },
    customHTML:  { type: String, default: "" }, // injected into <head>
  },
  { _id: false }
);

// ── Main Project Schema ───────────────────────────────────────────────────
const ProjectSchema = new mongoose.Schema(
  {
    name:       { type: String, required: true, trim: true, default: "Untitled Project" },
    slug:       { type: String, trim: true, lowercase: true, unique: true, sparse: true },
    userId:     { type: String, index: true },   // for multi-user support later
    canvas:     { type: CanvasNodeSchema, default: () => ({ tag: "div", attrs: {}, children: [] }) },
    meta:       { type: MetaSchema,       default: () => ({}) },
    thumbnail:  { type: String, default: "" },   // screenshot URL
    isPublished:{ type: Boolean, default: false },
    publishedUrl:{ type: String, default: "" },
  },
  {
    timestamps: true, // adds createdAt + updatedAt
    toJSON:     { virtuals: true },
    toObject:   { virtuals: true },
  }
);

// ── Auto-generate slug from name ─────────────────────────────────────────
ProjectSchema.pre("save", function (next) {
  if (!this.slug && this.name) {
    this.slug = this.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      + "-" + Date.now().toString(36);
  }
  next();
});

export const Project = mongoose.model("Project", ProjectSchema);

/* ─────────────────────────────────────────────────────────────────────────
   PostgreSQL / Sequelize equivalent (uncomment if using Postgres):

import { DataTypes, Model } from "sequelize";
import { sequelize } from "../utils/db.js";

export class Project extends Model {}

Project.init({
  id:          { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name:        { type: DataTypes.STRING, allowNull: false, defaultValue: "Untitled Project" },
  slug:        { type: DataTypes.STRING, unique: true },
  userId:      { type: DataTypes.STRING },
  canvas:      { type: DataTypes.JSONB, defaultValue: {} },
  meta:        { type: DataTypes.JSONB, defaultValue: {} },
  thumbnail:   { type: DataTypes.STRING },
  isPublished: { type: DataTypes.BOOLEAN, defaultValue: false },
}, {
  sequelize,
  modelName: "Project",
  tableName: "projects",
  underscored: true,
});
───────────────────────────────────────────────────────────────────────── */