import { NextRequest } from "next/server";
import {
  createOrder,
  getOrderById,
  getUserOrders,
  PaymentMethod,
  ShippingAddressInput,
} from "@/services/order.service";
import { connectDB } from "@/lib/db";
import { resolveUserId } from "@/lib/user";
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
    await connectDB();
    const userId = await resolveUserId();
    const body = (await request.json()) as CreateOrderBody;
    const { shippingAddress, paymentMethod } = body;
    if (!shippingAddress) {
      return errorResponse("Shipping address is required.", 400);
    }
    if (!paymentMethod) {
      return errorResponse("Payment method is required.", 400);
    }
    const order = await createOrder({
      userId,
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
    await connectDB();
    const userId = await resolveUserId();
    const orders = await getUserOrders(userId);
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
    await connectDB();
    const userId = await resolveUserId();
    if (!orderId) {
      return errorResponse("Order ID is required.", 400);
    }
    const order = await getOrderById({
      userId,
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
