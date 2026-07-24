import { NextRequest } from "next/server";
import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/services/cart.service";
import { resolveUserId } from "@/lib/user";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function addToCartController(request: NextRequest) {
  try {
    const userId = await resolveUserId();
    const body = await request.json();
    const { productId, quantity } = body;
    if (!productId) {
      return errorResponse("Product ID is required.", 400);
    }
    const cart = await addToCart({
      userId,
      productId,
      quantity,
    });
    return successResponse("Item added to your cart.", cart);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to add to cart.",
      400
    );
  }
}

export async function clearCartController() {
  try {
    const userId = await resolveUserId();
    const cart = await clearCart(userId);
    return successResponse("Cart cleared.", cart);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Could not clear cart.",
      400
    );
  }
}

export async function removeCartItemController(request: NextRequest) {
  try {
    const userId = await resolveUserId();
    const body = await request.json();
    const { productId } = body;
    if (!productId) {
      return errorResponse("Product ID is required.", 400);
    }
    const cart = await removeCartItem({
      userId,
      productId,
    });
    return successResponse("Item removed from cart.", cart);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to remove item.",
      400
    );
  }
}

export async function updateCartItemController(request: NextRequest) {
  try {
    const userId = await resolveUserId();
    const body = await request.json();
    const { productId, quantity } = body;
    if (!productId) {
      return errorResponse("Product ID is required.", 400);
    }
    if (quantity === undefined) {
      return errorResponse("Quantity is required.", 400);
    }
    const cart = await updateCartItem({
      userId,
      productId,
      quantity,
    });
    return successResponse("Cart quantity updated.", cart);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Cart update failed.",
      400
    );
  }
}

export async function getCartController() {
  try {
    const userId = await resolveUserId();
    const cart = await getCart(userId);
    return successResponse("Cart loaded.", cart);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to fetch cart.",
      400
    );
  }
}
