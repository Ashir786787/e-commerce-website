import mongoose, { Document, Model, Schema } from "mongoose";

export interface IDiscountCode extends Document {
  code: string;
  discountPercent: number;
  isActive: boolean;
  expiresAt?: Date;
  usedBy: {
    userId: mongoose.Types.ObjectId;
    usedAt: Date;
  }[];
  createdAt: Date;
}

const DiscountCodeSchema = new Schema<IDiscountCode>({
  code: { type: String, required: true, unique: true, uppercase: true, trim: true },
  discountPercent: { type: Number, required: true, min: 1, max: 100 },
  isActive: { type: Boolean, default: true },
  expiresAt: { type: Date },
  usedBy: [
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
      },
      usedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  },
  {
    timestamps: true,
  }
);

const DiscountCode: Model<IDiscountCode> =
  mongoose.models.DiscountCode ||
  mongoose.model<IDiscountCode>("DiscountCode", DiscountCodeSchema);

export default DiscountCode;