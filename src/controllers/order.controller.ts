import { NextRequest } from "next/server";
import { createOrder, getOrderById, getUserOrders, PaymentMethod, ShippingAddressInput } from "@/services/order.service";
import { connectDB } from "@/lib/db";
import { resolveUserId } from "@/lib/user";
import { successResponse, errorResponse } from "@/utils/api-response";

interface CreateOrderBody {
  shippingAddress?: ShippingAddressInput;
  paymentMethod?: PaymentMethod;
  discountCode?: string;
}

export async function createOrderController(request: NextRequest) {
  try {
    await connectDB();
    const userId = await resolveUserId();
    const body = (await request.json()) as CreateOrderBody;
    const { shippingAddress, paymentMethod, discountCode } = body;
    if (!shippingAddress) return errorResponse("Shipping address is required", 400);
    if (!paymentMethod) return errorResponse("Payment method is required", 400);
    const order = await createOrder({ userId, shippingAddress, paymentMethod, discountCode });
    return successResponse("Order created", order, 201);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Order failed", 400);
  }
}

export async function getUserOrdersController() {
  try {
    await connectDB();
    const orders = await getUserOrders(await resolveUserId());
    return successResponse("Orders loaded", orders);
  } catch (error) {
    return errorResponse(error instanceof Error ? error.message : "Failed to load orders", 400);
  }
}

export async function getOrderByIdController(orderId: string) {
  try {
    await connectDB();
    const userId = await resolveUserId();
    if (!orderId) return errorResponse("Order ID is required", 400);
    const order = await getOrderById({ userId, orderId });
    return successResponse("Order loaded", order);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to load order";
    return errorResponse(message, message === "Order not found" ? 404 : 400);
  }
}
