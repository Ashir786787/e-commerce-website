import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
  clearWishlist,
} from "@/services/wishlist.service";

type JwtPayload = {
  userId: string;
};

function getUserIdFromRequest(request: NextRequest): string {
  const token = request.cookies.get("novacart_token")?.value;

  if (!token) {
    throw new Error("Not authenticated.");
  }

  const decoded = jwt.verify(
    token,
    process.env.JWT_SECRET as string
  ) as JwtPayload;

  return decoded.userId;
}

function unauthorized() {
  return NextResponse.json(
    { success: false, message: "Not authenticated." },
    { status: 401 }
  );
}

export async function addToWishlistController(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
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

    if (msg === "Not authenticated.") return unauthorized();

    const status = msg === "Product is already in your wishlist." ? 409 : 500;

    return NextResponse.json({ success: false, message: msg }, { status });
  }
}

export async function getWishlistController(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const wishlist = await getWishlist(userId);

    return NextResponse.json(
      { success: true, wishlist },
      { status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Could not load wishlist.";

    if (msg === "Not authenticated.") return unauthorized();

    return NextResponse.json({ success: false, message: msg }, { status: 500 });
  }
}

export async function removeFromWishlistController(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
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

    if (msg === "Not authenticated.") return unauthorized();

    const status = msg === "Wishlist not found." ? 404 : 500;

    return NextResponse.json({ success: false, message: msg }, { status });
  }
}

export async function clearWishlistController(request: NextRequest) {
  try {
    const userId = getUserIdFromRequest(request);
    const wishlist = await clearWishlist(userId);

    return NextResponse.json(
      { success: true, message: "Wishlist cleared.", wishlist },
      { status: 200 }
    );
  } catch (error) {
    const msg = error instanceof Error ? error.message : "Failed to clear wishlist.";

    if (msg === "Not authenticated.") return unauthorized();

    const status = msg === "Wishlist not found." ? 404 : 500;

    return NextResponse.json({ success: false, message: msg }, { status });
  }
}
