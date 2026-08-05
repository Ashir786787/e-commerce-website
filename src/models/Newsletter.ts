import { Schema, model, models } from "mongoose";
import { INewsletter } from "@/types/Newsletter";

const NewsletterSchema = new Schema<INewsletter>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    subscribed: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Newsletter =
  models.Newsletter || model<INewsletter>("Newsletter", NewsletterSchema);

export default Newsletter;
