import { Projects } from "../db/jsonDb.js";
import { v4 as uuidv4 } from "uuid";

export class ProjectModel {
  constructor(data = {}) {
    this._id = data._id || data.id || uuidv4();
    this.id = this._id;
    this.name = (data.name || "Untitled Project").trim();
    this.slug = data.slug || (
      this.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
      "-" + Date.now().toString(36)
    );
    this.userId = data.userId || "default";
    this.pages = data.pages || [];
    this.thumbnail = data.thumbnail || "";
    this.isPublished = data.isPublished || false;
    this.globalMeta = {
      favicon: data.globalMeta?.favicon || "",
      lang: data.globalMeta?.lang || "en",
      globalCSS: data.globalMeta?.globalCSS || "",
      globalJS: data.globalMeta?.globalJS || "",
      customHTML: data.globalMeta?.customHTML || "",
      ...(data.globalMeta || {})
    };
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  async save() {
    this.updatedAt = new Date().toISOString();
    const existing = await Projects.findById(this.id);
    if (existing) {
      await Projects.findByIdAndUpdate(this.id, {
        name: this.name,
        slug: this.slug,
        pages: this.pages,
        thumbnail: this.thumbnail,
        isPublished: this.isPublished,
        globalMeta: this.globalMeta,
        updatedAt: this.updatedAt
      });
    } else {
      await Projects.create({
        id: this.id,
        _id: this._id,
        name: this.name,
        slug: this.slug,
        userId: this.userId,
        pages: this.pages,
        thumbnail: this.thumbnail,
        isPublished: this.isPublished,
        globalMeta: this.globalMeta,
        createdAt: this.createdAt,
        updatedAt: this.updatedAt
      });
    }
    return this;
  }

  toObject() {
    return {
      _id: this._id,
      id: this.id,
      name: this.name,
      slug: this.slug,
      userId: this.userId,
      pages: this.pages,
      thumbnail: this.thumbnail,
      isPublished: this.isPublished,
      globalMeta: this.globalMeta,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toJSON() {
    return this.toObject();
  }
}

export const Project = Object.assign(
  function (data) {
    return new ProjectModel(data);
  },
  {
    find: (filter, projection) => Projects.find(filter, projection),
    findById: (id) => Projects.findById(id),
    findOne: (filter) => Projects.findOne(filter),
    create: async (data) => {
      const doc = new ProjectModel(data);
      await doc.save();
      return doc;
    },
    findByIdAndUpdate: (id, updates, options) => Projects.findByIdAndUpdate(id, updates, options),
    findOneAndUpdate: (filter, updates, options) => Projects.findOneAndUpdate(filter, updates, options),
    findByIdAndDelete: (id) => Projects.findByIdAndDelete(id),
    deleteMany: (filter) => Projects.deleteMany(filter),
    countDocuments: (filter) => Projects.countDocuments(filter),
  }
);