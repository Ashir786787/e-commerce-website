import { Types } from "mongoose";

import Cart from "@/models/Cart";
import Product from "@/models/Product";

type AddToCartInput = {
  userId: string;
  productId: string;
  quantity?: number;
};

export async function addToCart({
  userId,
  productId,
  quantity = 1,
}: AddToCartInput) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  if (!Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID.");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1.");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found.");
  }

  if (product.stock < quantity) {
    throw new Error("Requested quantity exceeds available stock.");
  }

  let cart = await Cart.findOne({ user: userId });

  if (!cart) {
    cart = await Cart.create({
      user: userId,
      items: [
        {
          product: product._id,
          quantity,
          price: product.price,
        },
      ],
    });
  } else {
    const existingItem = cart.items.find(
      (item) => item.product.toString() === productId
    );

    if (existingItem) {
      const updatedQuantity = existingItem.quantity + quantity;

      if (updatedQuantity > product.stock) {
        throw new Error("Requested quantity exceeds available stock.");
      }

      existingItem.quantity = updatedQuantity;
      existingItem.price = product.price;
    } else {
      cart.items.push({
        product: product._id,
        quantity,
        price: product.price,
      });
    }

    await cart.save();
  }

  return Cart.findOne({ user: userId })
    .populate({
      path: "items.product",
      select: "name slug price images stock brand",
    })
    .lean();
}

export async function clearCart(userId: string) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error("Cart not found.");
  }

  cart.items = [];

  await cart.save();

  return {
    items: [],
  };
}

type RemoveCartItemInput = {
  userId: string;
  productId: string;
};

export async function removeCartItem({
  userId,
  productId,
}: RemoveCartItemInput) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  if (!Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID.");
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error("Cart not found.");
  }

  cart.items = cart.items.filter(
    (item) => item.product.toString() !== productId
  );

  await cart.save();

  return Cart.findOne({ user: userId })
    .populate({
      path: "items.product",
      select: "name slug price images stock brand",
    })
    .lean();
}

export async function getCart(userId: string) {
  const cart = await Cart.findOne({
    user: userId,
  })
    .populate({
      path: "items.product",
      select: "name slug price images stock brand",
    })
    .lean();

  if (!cart) {
    return {
      items: [],
    };
  }

  return cart;
}

type UpdateCartItemInput = {
  userId: string;
  productId: string;
  quantity: number;
};

export async function updateCartItem({
  userId,
  productId,
  quantity,
}: UpdateCartItemInput) {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid user ID.");
  }

  if (!Types.ObjectId.isValid(productId)) {
    throw new Error("Invalid product ID.");
  }

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be at least 1.");
  }

  const product = await Product.findById(productId);

  if (!product) {
    throw new Error("Product not found.");
  }

  if (quantity > product.stock) {
    throw new Error("Requested quantity exceeds available stock.");
  }

  const cart = await Cart.findOne({ user: userId });

  if (!cart) {
    throw new Error("Cart not found.");
  }

  const item = cart.items.find(
    (cartItem) => cartItem.product.toString() === productId
  );

  if (!item) {
    throw new Error("Product is not present in the cart.");
  }

  item.quantity = quantity;
  item.price = product.price;

  await cart.save();

  return Cart.findOne({ user: userId })
    .populate({
      path: "items.product",
      select: "name slug price images stock brand",
    })
    .lean();
}