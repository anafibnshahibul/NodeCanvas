import { Submissions } from "../db/jsonDb.js";
import { v4 as uuidv4 } from "uuid";

export class SubmissionModel {
  constructor(data = {}) {
    this._id = data._id || data.id || uuidv4();
    this.id = this._id;
    this.projectId = data.projectId || "general";
    this.formName = data.formName || "Contact Form";
    this.data = data.data || {};
    this.sourcePage = data.sourcePage || "";
    this.ip = data.ip || "127.0.0.1";
    this.createdAt = data.createdAt || new Date().toISOString();
  }

  async save() {
    return Submissions.create(this);
  }

  toObject() {
    return {
      _id: this._id,
      id: this.id,
      projectId: this.projectId,
      formName: this.formName,
      data: this.data,
      sourcePage: this.sourcePage,
      ip: this.ip,
      createdAt: this.createdAt
    };
  }

  toJSON() {
    return this.toObject();
  }
}

export const Submission = Object.assign(
  function (data) {
    return new SubmissionModel(data);
  },
  {
    find: (filter, projection) => Submissions.find(filter, projection),
    findById: (id) => Submissions.findById(id),
    create: async (data) => {
      const doc = new SubmissionModel(data);
      return doc.save();
    },
    findByIdAndDelete: (id) => Submissions.findByIdAndDelete(id),
    deleteMany: (filter) => Submissions.deleteMany(filter),
    countDocuments: (filter) => Submissions.countDocuments(filter),
  }
);
