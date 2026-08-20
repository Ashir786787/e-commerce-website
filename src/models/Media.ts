import { Schema, model, models } from "mongoose";

export interface IMedia {
  _id: string;
  url: string;
  publicId?: string;
  filename: string;
  uploadedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

const MediaSchema = new Schema<IMedia>(
  {
    url: { type: String, required: true },
    publicId: { type: String, default: "" },
    filename: { type: String, default: "uploaded-image" },
    uploadedBy: { type: String, required: true },
  },
  { timestamps: true }
);

const Media = models.Media || model<IMedia>("Media", MediaSchema);

export default Media;
