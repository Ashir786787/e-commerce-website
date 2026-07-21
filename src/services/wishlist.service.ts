import { Types } from "mongoose";

import Wishlist from "@/models/Wishlist";

export async function addToWishlist(userId: string, productId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  if (!Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID.");
  }

  let wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    wishlist = await Wishlist.create({
      user: userId,
      products: [productId],
    });
  } else {
    const alreadyExists = wishlist.products.some(
      (p) => p.toString() === productId
    );

    if (alreadyExists) {
      throw new Error("Product is already in your wishlist.");
    }

    wishlist.products.push(new Types.ObjectId(productId));
    await wishlist.save();
  }

  return Wishlist.findOne({ user: userId })
    .populate({
      path: "products",
      select: "name slug price images stock brand",
    })
    .lean();
}

export async function getWishlist(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  const wishlist = await Wishlist.findOne({ user: userId })
    .populate({
      path: "products",
      select: "name slug price images stock brand",
    })
    .lean();

  if (!wishlist) {
    return { products: [] };
  }

  return wishlist;
}

export async function removeFromWishlist(userId: string, productId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  if (!Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID.");
  }

  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    throw new Error("No wishlist found for this user.");
  }

  wishlist.products = wishlist.products.filter(
    (p) => p.toString() !== productId
  );

  await wishlist.save();

  return Wishlist.findOne({ user: userId })
    .populate({
      path: "products",
      select: "name slug price images stock brand",
    })
    .lean();
}

export async function clearWishlist(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  const wishlist = await Wishlist.findOne({ user: userId });

  if (!wishlist) {
    throw new Error("Nothing to clear — wishlist is empty.");
  }

  wishlist.products = [];
  await wishlist.save();

  return { products: [] };
}
