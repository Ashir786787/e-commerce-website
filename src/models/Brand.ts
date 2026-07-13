import { Schema, model, models } from "mongoose";
import { IBrand } from "@/types/Brand";

const BrandSchema = new Schema<IBrand>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 80,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },

    logo: {
      type: String,
      trim: true,
      default: "",
    },

    website: {
      type: String,
      trim: true,
      default: "",
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

BrandSchema.index({
  name: "text",
  description: "text",
});

const Brand =
  models.Brand || model<IBrand>("Brand", BrandSchema);

export default Brand;