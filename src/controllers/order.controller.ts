import { NextRequest } from "next/server";
import {
  createOrder,
  getOrderById,
  getUserOrders,
  PaymentMethod,
  ShippingAddressInput,
} from "@/services/order.service";
import { getCurrentUser } from "@/services/auth.service";
import {
  successResponse,
  errorResponse,
} from "@/utils/api-response";

type CreateOrderBody = {
  shippingAddress?: ShippingAddressInput;
  paymentMethod?: PaymentMethod;
};

export async function createOrderController(
  request: NextRequest
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse("Not authenticated.", 401);
    }
    const body = (await request.json()) as CreateOrderBody;
    const { shippingAddress, paymentMethod } = body;
    if (!shippingAddress) {
      return errorResponse("Shipping address is required.", 400);
    }
    if (!paymentMethod) {
      return errorResponse("Payment method is required.", 400);
    }
    const order = await createOrder({
      userId: user.id.toString(),
      shippingAddress,
      paymentMethod,
    });
    return successResponse("Order created successfully.", order, 201);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to create order.",
      400
    );
  }
}

export async function getUserOrdersController() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse("Not authenticated.", 401);
    }
    const orders = await getUserOrders(user.id.toString());
    return successResponse("Orders loaded successfully.", orders);
  } catch (error) {
    return errorResponse(
      error instanceof Error ? error.message : "Failed to load orders.",
      400
    );
  }
}

export async function getOrderByIdController(
  orderId: string
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return errorResponse("Not authenticated.", 401);
    }
    if (!orderId) {
      return errorResponse("Order ID is required.", 400);
    }
    const order = await getOrderById({
      userId: user.id.toString(),
      orderId,
    });
    return successResponse("Order loaded successfully.", order);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to load order.";
    const status = message === "Order not found." ? 404 : 400;
    return errorResponse(message, status);
  }
}
