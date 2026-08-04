import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getCurrentUser } from "@/services/auth.service";

type CreateProductBody = {
  name?: string;
  slug?: string;
  description?: string;
  price?: number;
  originalPrice?: number | null;
  category?: string;
  brand?: string;
  images?: Array<{
    url: string;
    publicId?: string;
  }>;
  stock?: number;
  isFeatured?: boolean;
  isTrending?: boolean;
  isActive?: boolean;
};

function normalizeSlug(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const currentUser = await getCurrentUser();

    if (!currentUser || currentUser.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Admin access is required." },
        { status: 403 }
      );
    }

    const body = (await request.json()) as CreateProductBody;

    const name = body.name?.trim();
    const slug = normalizeSlug(body.slug || body.name || "");
    const description = body.description?.trim();
    const brand = body.brand?.trim();
    const categoryId = body.category;

    if (!name || name.length < 3) {
      return NextResponse.json(
        { success: false, message: "Product name must contain at least 3 characters." },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "A valid product slug is required." },
        { status: 400 }
      );
    }

    if (!description || description.length < 10) {
      return NextResponse.json(
        { success: false, message: "Description must contain at least 10 characters." },
        { status: 400 }
      );
    }

    if (!brand) {
      return NextResponse.json(
        { success: false, message: "Product brand is required." },
        { status: 400 }
      );
    }

    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        { success: false, message: "Please select a valid category." },
        { status: 400 }
      );
    }

    const price = Number(body.price);
    const originalPrice =
      body.originalPrice === null || body.originalPrice === undefined
        ? undefined
        : Number(body.originalPrice);
    const stock = Number(body.stock);

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid price." },
        { status: 400 }
      );
    }

    if (originalPrice !== undefined && (!Number.isFinite(originalPrice) || originalPrice < 0)) {
      return NextResponse.json(
        { success: false, message: "Please provide a valid original price." },
        { status: 400 }
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        { success: false, message: "Stock must be a non-negative whole number." },
        { status: 400 }
      );
    }

    const images = (body.images || [])
      .map((image) => ({
        url: image.url?.trim(),
        publicId: image.publicId?.trim() || undefined,
      }))
      .filter((image) => image.url);

    if (images.length === 0) {
      return NextResponse.json(
        { success: false, message: "At least one product image URL is required." },
        { status: 400 }
      );
    }

    const [existingProduct, category] = await Promise.all([
      Product.findOne({ slug }).lean(),
      Category.findById(categoryId).select("_id name isActive").lean(),
    ]);

    if (existingProduct) {
      return NextResponse.json(
        { success: false, message: "A product with this slug already exists." },
        { status: 409 }
      );
    }

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Selected category was not found." },
        { status: 404 }
      );
    }

    const product = await Product.create({
      name,
      slug,
      description,
      price,
      originalPrice,
      category: new Types.ObjectId(categoryId),
      brand,
      images,
      stock,
      sold: 0,
      rating: 0,
      reviewCount: 0,
      isFeatured: Boolean(body.isFeatured),
      isTrending: Boolean(body.isTrending),
      isActive: body.isActive ?? true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Product created successfully.",
        data: {
          id: product._id.toString(),
          name: product.name,
          slug: product.slug,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Create admin product error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error ? error.message : "Unable to create product.",
      },
      { status: 500 }
    );
  }
}
