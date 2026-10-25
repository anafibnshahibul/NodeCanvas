import { Pages } from "../db/jsonDb.js";
import { v4 as uuidv4 } from "uuid";

export class PageModel {
  constructor(data = {}) {
    this._id = data._id || data.id || uuidv4();
    this.id = this._id;
    this.projectId = data.projectId;
    this.name = (data.name || "Untitled Page").trim();
    this.slug = (data.slug || "index").trim();
    this.order = typeof data.order === "number" ? data.order : 0;
    this.canvas = data.canvas || {};
    this.meta = {
      title: data.meta?.title || "",
      description: data.meta?.description || "",
      ogImage: data.meta?.ogImage || "",
      customCSS: data.meta?.customCSS || "",
      customJS: data.meta?.customJS || "",
      ...(data.meta || {})
    };
    this.isHomepage = Boolean(data.isHomepage);
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  async save() {
    this.updatedAt = new Date().toISOString();
    const existing = await Pages.findById(this.id);
    if (existing) {
      await Pages.findByIdAndUpdate(this.id, {
        name: this.name,
        slug: this.slug,
        order: this.order,
        canvas: this.canvas,
        meta: this.meta,
        isHomepage: this.isHomepage,
        updatedAt: this.updatedAt
      });
    } else {
      await Pages.create({
        id: this.id,
        _id: this._id,
        projectId: this.projectId,
        name: this.name,
        slug: this.slug,
        order: this.order,
        canvas: this.canvas,
        meta: this.meta,
        isHomepage: this.isHomepage,
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
      projectId: this.projectId,
      name: this.name,
      slug: this.slug,
      order: this.order,
      canvas: this.canvas,
      meta: this.meta,
      isHomepage: this.isHomepage,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  toJSON() {
    return this.toObject();
  }
}

export const Page = Object.assign(
  function (data) {
    return new PageModel(data);
  },
  {
    find: (filter, projection) => Pages.find(filter, projection),
    findById: (id) => Pages.findById(id),
    findOne: (filter) => Pages.findOne(filter),
    create: async (data) => {
      const doc = new PageModel(data);
      await doc.save();
      return doc;
    },
    findByIdAndUpdate: (id, updates, options) => Pages.findByIdAndUpdate(id, updates, options),
    findOneAndUpdate: (filter, updates, options) => Pages.findOneAndUpdate(filter, updates, options),
    findByIdAndDelete: (id) => Pages.findByIdAndDelete(id),
    findOneAndDelete: (filter) => Pages.findOneAndDelete(filter),
    deleteMany: (filter) => Pages.deleteMany(filter),
    countDocuments: (filter) => Pages.countDocuments(filter),
  }
);