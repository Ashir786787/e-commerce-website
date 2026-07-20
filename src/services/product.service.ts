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

  const categoryExists = await Category.exists({ _id: validatedData.category, isActive: true });
  if (!categoryExists) {
    throw new Error("Category not found or inactive.");
  }

  const existingProduct = await Product.findOne({ slug: validatedData.slug });
  if (existingProduct) {
    throw new Error("A product with this slug already exists.");
  }

  if (validatedData.originalPrice !== undefined && validatedData.originalPrice < validatedData.price) {
    throw new Error("Original price cannot be lower than the selling price.");
  }
  return Product.create({
    ...validatedData,
    category: new Types.ObjectId(validatedData.category),
  });
}

interface GetProductsOptions {
  search?: string;
  categories?: string[];
  brands?: string[];
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  trending?: boolean;
  page?: number;
  limit?: number;
  sort?: string;
}

export async function getProducts({
  search,
  categories,
  brands,
  minPrice,
  maxPrice,
  featured,
  trending,
  page = 1,
  limit = 12,
  sort = "newest",
}: GetProductsOptions) {
  const query: Record<string, unknown> = { isActive: true };

  if (search?.trim()) {
    const term = search.trim();
    query.$or = [
      { name: { $regex: term, $options: "i" } },
      { description: { $regex: term, $options: "i" } },
      { brand: { $regex: term, $options: "i" } },
    ];
  }

  if (categories && categories.length > 0) {
    const normalizedCategories = categories.map((c) => c.trim().toLowerCase()).filter(Boolean);
    const categoryDocuments = await Category.find({
      slug: { $in: normalizedCategories },
      isActive: true,
    }).select("_id").lean();

    if (categoryDocuments.length === 0) {
      return {
        products: [],
        pagination: { page, limit, totalProducts: 0, totalPages: 1, hasNextPage: false, hasPreviousPage: false },
      };
    }

    query.category = { $in: categoryDocuments.map((c) => c._id) };
  }

  if (brands && brands.length > 0) {
    const normalizedBrands = brands.map((b) => b.trim()).filter(Boolean);
    query.brand = { $in: normalizedBrands };
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    query.price = {};
    if (minPrice !== undefined) (query.price as Record<string, number>).$gte = minPrice;
    if (maxPrice !== undefined) (query.price as Record<string, number>).$lte = maxPrice;
  }

  if (featured !== undefined) query.isFeatured = featured;
  if (trending !== undefined) query.isTrending = trending;

  const skip = (page - 1) * limit;
  const totalProducts = await Product.countDocuments(query);
  const totalPages = Math.max(1, Math.ceil(totalProducts / limit));

  let sortOptions: Record<string, 1 | -1> = {
    createdAt: -1,
  };

  switch (sort) {
    case "price-asc":
      sortOptions = {
        price: 1,
      };
      break;

    case "price-desc":
      sortOptions = {
        price: -1,
      };
      break;

    case "name-asc":
      sortOptions = {
        name: 1,
      };
      break;

    case "name-desc":
      sortOptions = {
        name: -1,
      };
      break;

    case "featured":
      sortOptions = {
        isFeatured: -1,
        createdAt: -1,
      };
      break;

    case "newest":
    default:
      sortOptions = {
        createdAt: -1,
      };
      break;
  }

  const products = await Product.find(query)
    .populate("category", "name slug image")
    .sort(sortOptions)
    .skip(skip)
    .limit(limit)
    .lean();

  return {
    products,
    pagination: {
      page,
      limit,
      totalProducts,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
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

export async function updateProduct(id: string, data: UpdateProductInput) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid product ID.");
  }

  const validatedData = updateProductSchema.parse(data);

  if (validatedData.category && !Types.ObjectId.isValid(validatedData.category)) {
    throw new Error("Invalid category ID.");
  }

  if (validatedData.category) {
    const categoryExists = await Category.exists({ _id: validatedData.category, isActive: true });
    if (!categoryExists) {
      throw new Error("Category not found or inactive.");
    }
  }

  if (validatedData.slug) {
    const existingProduct = await Product.findOne({ slug: validatedData.slug, _id: { $ne: id } });
    if (existingProduct) {
      throw new Error("A product with this slug already exists.");
    }
  }

  const product = await Product.findByIdAndUpdate(id, validatedData, { new: true, runValidators: true });
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
  const product = await Product.findOne({ slug, isActive: true })
    .populate("category", "name slug image")
    .lean();

  if (!product) {
    throw new Error("Product not found.");
  }
  return product;
}
