import { NextRequest } from "next/server";

import {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from "@/services/cart.service";
import { getCurrentUser } from "@/services/auth.service";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function addToCartController(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Unauthorized.", 401);
    }

    const body = await request.json();

    const { productId, quantity } = body;

    if (!productId) {
      return errorResponse("Product ID is required.", 400);
    }

    const cart = await addToCart({
      userId: user.id.toString(),
      productId,
      quantity,
    });

    return successResponse(
      "Item added to your cart.",
      cart
    );
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to add to cart.",
      400
    );
  }
}

export async function clearCartController() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Not authenticated.", 401);
    }

    const cart = await clearCart(user.id.toString());

    return successResponse(
      "Cart cleared.",
      cart
    );
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Could not clear cart.",
      400
    );
  }
}

export async function removeCartItemController(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Not authenticated.", 401);
    }

    const body = await request.json();

    const { productId } = body;

    if (!productId) {
      return errorResponse("Product ID is required.", 400);
    }

    const cart = await removeCartItem({
      userId: user.id.toString(),
      productId,
    });

    return successResponse(
      "Item removed from cart.",
      cart
    );
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to remove item.",
      400
    );
  }
}

export async function updateCartItemController(request: NextRequest) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Not authenticated.", 401);
    }

    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId) {
      return errorResponse("Product ID is required.", 400);
    }

    if (quantity === undefined) {
      return errorResponse("Quantity is required.", 400);
    }

    const cart = await updateCartItem({
      userId: user.id.toString(),
      productId,
      quantity,
    });

    return successResponse(
      "Cart quantity updated.",
      cart
    );
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Cart update failed.",
      400
    );
  }
}

export async function getCartController() {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return errorResponse("Not authenticated.", 401);
    }

    const cart = await getCart(user.id.toString());

    return successResponse(
      "Cart loaded.",
      cart
    );
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to fetch cart.",
      400
    );
  }
}
