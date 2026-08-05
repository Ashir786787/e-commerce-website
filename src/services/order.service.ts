import mongoose, { Types } from "mongoose";

import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";
import { validateDiscountCode, markCodeUsed } from "@/lib/discount";
import {
  ADMIN_NOTIFICATION_KEY,
  type CreateNotificationInput,
} from "@/types/Notification";
import { createNotificationSafe } from "@/services/notification.service";
import { publishOrderUpdateSafe } from "@/services/order-realtime.server";

const LOW_STOCK_THRESHOLD = 5;

export type PaymentMethod = "cod" | "card" | "bank";

export type ShippingAddressInput = {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
};

type CreateOrderInput = {
  userId: string;
  shippingAddress: ShippingAddressInput;
  paymentMethod: PaymentMethod;
  discountCode?: string;
};

function calculateOrderSummary(items: { quantity: number; price: number }[]) {
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const deliveryFee = subtotal === 0 || subtotal >= 5000 ? 0 : 300;
  return { subtotal, deliveryFee, tax: 0, discount: 0, total: subtotal + deliveryFee };
}

function validateShippingAddress(shippingAddress: ShippingAddressInput) {
  const requiredFields: (keyof ShippingAddressInput)[] = ["fullName", "email", "phone", "address", "city", "postalCode", "country"];
  for (const field of requiredFields) {
    if (!shippingAddress[field]?.trim()) throw new Error(`${field} is required`);
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)) throw new Error("Invalid email");
}

export async function createOrder({ userId, shippingAddress, paymentMethod, discountCode }: CreateOrderInput) {
  if (!Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  validateShippingAddress(shippingAddress);
  if (!["cod", "card", "bank"].includes(paymentMethod)) throw new Error("Invalid payment method");

  const session = await mongoose.startSession();
  let createdOrderId: string | null = null;
  let appliedDiscountPercent = 0;
  const lowStockProducts: { id: string; name: string; stock: number }[] = [];

  try {
    await session.withTransaction(async () => {
      const cart = await Cart.findOne({ user: userId }).session(session);
      if (!cart || cart.items.length === 0) throw new Error("Cart is empty");

      const orderItems: { product: Types.ObjectId; quantity: number; price: number }[] = [];

      for (const item of cart.items) {
        const product = await Product.findById(item.product).session(session);
        if (!product) throw new Error("A product in your cart no longer exists");
        if (product.stock < item.quantity) throw new Error(`${product.name} is out of stock`);

        orderItems.push({ product: product._id, quantity: item.quantity, price: product.price });
        product.stock -= item.quantity;
        await product.save({ session });

        if (product.stock <= LOW_STOCK_THRESHOLD) {
          lowStockProducts.push({
            id: product._id.toString(),
            name: product.name,
            stock: product.stock,
          });
        }
      }

      const summary = calculateOrderSummary(orderItems);

      if (discountCode) {
        const validation = await validateDiscountCode(discountCode, userId);
        appliedDiscountPercent = validation.discountPercent;
        summary.discount = Math.round((summary.subtotal * appliedDiscountPercent) / 100);
        summary.total = summary.subtotal + summary.deliveryFee - summary.discount;
      }

      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
      const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();

      const orderData: Record<string, unknown> = {
        user: new Types.ObjectId(userId),
        orderNumber: `NC-${datePart}-${randomPart}`,
        items: orderItems,
        shippingAddress: {
          fullName: shippingAddress.fullName.trim(),
          email: shippingAddress.email.trim().toLowerCase(),
          phone: shippingAddress.phone.trim(),
          address: shippingAddress.address.trim(),
          city: shippingAddress.city.trim(),
          postalCode: shippingAddress.postalCode.trim(),
          country: shippingAddress.country.trim(),
        },
        paymentMethod,
        subtotal: summary.subtotal,
        deliveryFee: summary.deliveryFee,
        tax: summary.tax,
        discount: summary.discount,
        total: summary.total,
        orderStatus: "pending",
        paymentStatus: "pending",
      };

      if (discountCode && appliedDiscountPercent > 0) {
        orderData.discountCode = discountCode.toUpperCase().trim();
        orderData.discountPercent = appliedDiscountPercent;
      }

      const createdOrders = await Order.create([orderData], { session });
      createdOrderId = createdOrders[0]._id.toString();

      if (discountCode && appliedDiscountPercent > 0) await markCodeUsed(discountCode, userId);

      cart.items = [];
      await cart.save({ session });
    });

    if (!createdOrderId) throw new Error("Order could not be created");

    const createdOrder = await Order.findById(createdOrderId)
      .populate({ path: "items.product", select: "name slug images brand price" })
      .lean();

    if (!createdOrder) throw new Error("Order could not be created");

    const priceFormatter = new Intl.NumberFormat("en-PK");

    void createNotificationSafe({
      targetKey: ADMIN_NOTIFICATION_KEY,
      type: "new_order",
      title: "New order received",
      body: `Order ${createdOrder.orderNumber} — Rs. ${priceFormatter.format(createdOrder.total)}`,
      link: `/admin/orders/${createdOrderId}`,
    });

    void publishOrderUpdateSafe({
      orderId: createdOrderId,
      userId,
      orderNumber: createdOrder.orderNumber,
      orderStatus: createdOrder.orderStatus,
      paymentStatus: createdOrder.paymentStatus,
    });

    for (const product of lowStockProducts) {
      const notification: CreateNotificationInput = {
        targetKey: ADMIN_NOTIFICATION_KEY,
        type: "low_stock",
        title: "Low stock alert",
        body: `${product.name} has only ${product.stock} left in stock`,
        link: "/admin/products",
        notificationId: `lowstock_${product.id}`,
      };

      void createNotificationSafe(notification);
    }

    return createdOrder;
  } finally {
    await session.endSession();
  }
}

export async function getUserOrders(userId: string) {
  if (!Types.ObjectId.isValid(userId)) throw new Error("Invalid user ID");
  return Order.find({ user: userId })
    .populate({ path: "items.product", select: "name slug images brand price" })
    .sort({ createdAt: -1 })
    .lean();
}