import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IWishlist extends Document {
  user: Types.ObjectId;
  products: Types.ObjectId[];
}

const WishlistSchema = new Schema<IWishlist>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    products: {
      type: [Schema.Types.ObjectId],
      ref: "Product",
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

const Wishlist: Model<IWishlist> =
  mongoose.models.Wishlist || mongoose.model<IWishlist>("Wishlist", WishlistSchema);

export default Wishlist;
