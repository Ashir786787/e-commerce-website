import mongoose, { Types } from "mongoose";

import Order from "@/models/Order";
import Cart from "@/models/Cart";
import Product from "@/models/Product";

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
};

function calculateOrderSummary(
  items: Array<{
    quantity: number;
    price: number;
  }>
) {
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );
  const deliveryFee =
    subtotal === 0 || subtotal >= 5000 ? 0 : 300;
  const total = subtotal + deliveryFee;
  return {
    subtotal,
    deliveryFee,
    tax: 0,
    discount: 0,
    total,
  };
}

function validateShippingAddress(
  shippingAddress: ShippingAddressInput
) {
  const requiredFields: Array<keyof ShippingAddressInput> = [
    "fullName",
    "email",
    "phone",
    "address",
    "city",
    "postalCode",
    "country",
  ];

  for (const field of requiredFields) {
    const value = shippingAddress[field];
    if (!value || !value.trim()) {
      throw new Error(
        `${field} is required.`
      );
    }
  }

  const emailPattern =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(shippingAddress.email)) {
    throw new Error(
      "Please provide a valid email address."
    );
  }
}

export async function createOrder({
  userId,
  shippingAddress,
  paymentMethod,
}: CreateOrderInput) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }
  validateShippingAddress(shippingAddress);

  const allowedPaymentMethods: PaymentMethod[] = [
    "cod",
    "card",
    "bank",
  ];
  if (!allowedPaymentMethods.includes(paymentMethod)) {
    throw new Error("Invalid payment method.");
  }

  const session = await mongoose.startSession();
  let createdOrderId: string | null = null;

  try {
    await session.withTransaction(async () => {
      const cart = await Cart.findOne({
        user: userId,
      }).session(session);
      if (!cart || cart.items.length === 0) {
        throw new Error(
          "Your cart is empty."
        );
      }

      const orderItems: Array<{
        product: Types.ObjectId;
        quantity: number;
        price: number;
      }> = [];

      for (const cartItem of cart.items) {
        const product = await Product.findById(
          cartItem.product
        ).session(session);

        if (!product) {
          throw new Error(
            "One of the products in your cart no longer exists."
          );
        }
        if (product.stock < cartItem.quantity) {
          throw new Error(
            `${product.name} does not have enough stock.`
          );
        }

        orderItems.push({
          product: product._id,
          quantity: cartItem.quantity,
          price: product.price,
        });
        product.stock -= cartItem.quantity;
        await product.save({
          session,
        });
      }

      const summary =
        calculateOrderSummary(orderItems);

      const now = new Date();
      const datePart = now.toISOString().slice(0, 10).replace(/-/g, "");
      const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
      const orderNumber = `NC-${datePart}-${randomPart}`;

      const createdOrders = await Order.create(
        [
          {
            user: new Types.ObjectId(userId),
            orderNumber,
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
          },
        ],
        {
          session,
        }
      );

      createdOrderId =
        createdOrders[0]._id.toString();
      cart.items = [];
      await cart.save({
        session,
      });
    });

    if (!createdOrderId) {
      throw new Error(
        "Order could not be created."
      );
    }

    return Order.findById(createdOrderId)
      .populate({
        path: "items.product",
        select: "name slug images brand price",
      })
      .lean();
  } finally {
    await session.endSession();
  }
}

export async function getUserOrders(
  userId: string
) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }
  return Order.find({
    user: userId,
  })
    .populate({
      path: "items.product",
      select: "name slug images brand price",
    })
    .sort({
      createdAt: -1,
    })
    .lean();
}

export async function getOrderById({
  userId,
  orderId,
}: {
  userId: string;
  orderId: string;
}) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }
  if (!Types.ObjectId.isValid(orderId)) {
    throw new Error("Invalid order ID.");
  }
  const order = await Order.findOne({
    _id: orderId,
    user: userId,
  })
    .populate({
      path: "items.product",
      select: "name slug images brand price",
    })
    .lean();
  if (!order) {
    throw new Error(
      "Order not found."
    );
  }
  return order;
}
