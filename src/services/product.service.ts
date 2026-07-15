import { Types } from "mongoose";

import Product from "@/models/Product";
import Category from "@/models/Category";

import {
  createProductSchema,
  updateProductSchema,
  type CreateProductInput,
  type UpdateProductInput,
} from "@/validations/product.validation";

export async function createProduct(data: CreateProductInput) {
  const validatedData = createProductSchema.parse(data);

  if (!Types.ObjectId.isValid(validatedData.category)) {
    throw new Error("Invalid category ID.");
  }

  const categoryExists = await Category.exists({
    _id: validatedData.category,
    isActive: true,
  });

  if (!categoryExists) {
    throw new Error("Category not found or inactive.");
  }

  const existingProduct = await Product.findOne({
    slug: validatedData.slug,
  });

  if (existingProduct) {
    throw new Error("A product with this slug already exists.");
  }

  if (
    validatedData.originalPrice !== undefined &&
    validatedData.originalPrice < validatedData.price
  ) {
    throw new Error(
      "Original price cannot be lower than the selling price."
    );
  }

  const product = await Product.create({
    ...validatedData,
    category: new Types.ObjectId(validatedData.category),
  });

  return product;
}

export async function getProducts(search?: string) {
  const query: Record<string, unknown> = {
    isActive: true,
  };

  if (search?.trim()) {
    const searchTerm = search.trim();

    query.$or = [
      {
        name: {
          $regex: searchTerm,
          $options: "i",
        },
      },
      {
        description: {
          $regex: searchTerm,
          $options: "i",
        },
      },
      {
        brand: {
          $regex: searchTerm,
          $options: "i",
        },
      },
    ];
  }

  const products = await Product.find(query)
    .populate("category", "name slug image")
    .sort({ createdAt: -1 })
    .lean();

  return products;
}

export async function getProductById(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid product ID.");
  }

  const product = await Product.findById(id)
    .populate("category", "name slug image")
    .lean();

  if (!product) {
    throw new Error("Product not found.");
  }

  return product;
}

export async function updateProduct(
  id: string,
  data: UpdateProductInput
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid product ID.");
  }

  const validatedData = updateProductSchema.parse(data);

  if (
    validatedData.category &&
    !Types.ObjectId.isValid(validatedData.category)
  ) {
    throw new Error("Invalid category ID.");
  }

  if (validatedData.category) {
    const categoryExists = await Category.exists({
      _id: validatedData.category,
      isActive: true,
    });

    if (!categoryExists) {
      throw new Error("Category not found or inactive.");
    }
  }

  if (validatedData.slug) {
    const existingProduct = await Product.findOne({
      slug: validatedData.slug,
      _id: { $ne: id },
    });

    if (existingProduct) {
      throw new Error("A product with this slug already exists.");
    }
  }

  const product = await Product.findByIdAndUpdate(
    id,
    validatedData,
    {
      new: true,
      runValidators: true,
    }
  );

  if (!product) {
    throw new Error("Product not found.");
  }

  return product;
}

export async function deleteProduct(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid product ID.");
  }

  const product = await Product.findByIdAndDelete(id);

  if (!product) {
    throw new Error("Product not found.");
  }

  return product;
}

export async function getProductBySlug(slug: string) {
  const product = await Product.findOne({
    slug,
    isActive: true,
  })
    .populate("category", "name slug image")
    .lean();

  if (!product) {
    throw new Error("Product not found.");
  }

  return product;
}