import { NextRequest, NextResponse } from "next/server";

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "@/services/wishlist.service";
import { connectDB } from "@/lib/db";
import { resolveUserId } from "@/lib/user";
import "@/models/Product";

export async function addToWishlistController(request: NextRequest) {
  try {
    await connectDB();
    const userId = await resolveUserId();
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required." },
        { status: 400 }
      );
    }

    const wishlist = await addToWishlist(userId, productId);

    return NextResponse.json(
      { success: true, message: "Product added to wishlist.", wishlist },
      { status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to add to wishlist.";

    const status = msg === "Product is already in your wishlist." ? 409 : 500;

    return NextResponse.json({ success: false, message: msg }, { status });
  }
}

export async function getWishlistController() {
  try {
    await connectDB();
    const userId = await resolveUserId();
    const wishlist = await getWishlist(userId);

    return NextResponse.json(
      { success: true, wishlist },
      { status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Could not load wishlist.";

    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function removeFromWishlistController(request: NextRequest) {
  try {
    await connectDB();
    const userId = await resolveUserId();
    const body = await request.json();
    const { productId } = body;

    if (!productId) {
      return NextResponse.json(
        { success: false, message: "Product ID is required." },
        { status: 400 }
      );
    }

    const wishlist = await removeFromWishlist(userId, productId);

    return NextResponse.json(
      { success: true, message: "Product removed from wishlist.", wishlist },
      { status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unable to remove product.";

    const status = msg === "Wishlist not found." ? 404 : 500;

    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
