import { Schema, model, models } from "mongoose";
import { IProduct } from "@/types/Product";

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 150,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    shortDescription: {
      type: String,
      required: true,
      trim: true,
      maxlength: 250,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },

    discountPrice: {
      type: Number,
      min: 0,
      default: undefined,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },

    brand: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    images: {
      type: [String],
      required: true,
      default: [],
    },

    thumbnail: {
      type: String,
      required: true,
      trim: true,
    },

    stock: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    sku: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    numReviews: {
      type: Number,
      min: 0,
      default: 0,
    },

    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    tags: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

ProductSchema.index({
  name: "text",
  shortDescription: "text",
  description: "text",
  brand: "text",
  tags: "text",
});

ProductSchema.pre("validate", async function () {
  if (
    this.discountPrice !== undefined &&
    this.discountPrice >= this.price
  ) {
    this.invalidate(
      "discountPrice",
      "Discount price must be lower than the regular price."
    );
  }
});

const Product =
  models.Product || model<IProduct>("Product", ProductSchema);

export default Product;