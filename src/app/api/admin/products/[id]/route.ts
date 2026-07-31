import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import Product from "@/models/Product";
import Category from "@/models/Category";
import { getCurrentUser } from "@/services/auth.service";

interface ProductRouteProps {
  params: Promise<{
    id: string;
  }>;
}

type UpdateProductBody = {
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

async function requireAdmin() {
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Admin access is required.");
  }

  return currentUser;
}

export async function GET(
  _request: NextRequest,
  { params }: ProductRouteProps
) {
  try {
    await connectDB();
    await requireAdmin();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID.",
        },
        {
          status: 400,
        }
      );
    }

    const product = await Product.findById(id)
      .populate({
        path: "category",
        select: "name slug",
      })
      .lean();

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      data: product,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to load product.",
      },
      {
        status:
          error instanceof Error &&
          error.message === "Admin access is required."
            ? 403
            : 500,
      }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: ProductRouteProps
) {
  try {
    await connectDB();
    await requireAdmin();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID.",
        },
        {
          status: 400,
        }
      );
    }

    const product = await Product.findById(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    const body = (await request.json()) as UpdateProductBody;

    const name = body.name?.trim();
    const slug = normalizeSlug(body.slug || body.name || product.slug);
    const description = body.description?.trim();
    const brand = body.brand?.trim();
    const categoryId = body.category;

    if (!name || name.length < 3) {
      return NextResponse.json(
        {
          success: false,
          message: "Product name must contain at least 3 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (!slug) {
      return NextResponse.json(
        {
          success: false,
          message: "A valid product slug is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!description || description.length < 10) {
      return NextResponse.json(
        {
          success: false,
          message: "Description must contain at least 10 characters.",
        },
        {
          status: 400,
        }
      );
    }

    if (!brand) {
      return NextResponse.json(
        {
          success: false,
          message: "Product brand is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (!categoryId || !Types.ObjectId.isValid(categoryId)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please select a valid category.",
        },
        {
          status: 400,
        }
      );
    }

    const price = Number(body.price);
    const originalPrice =
      body.originalPrice === null ||
      body.originalPrice === undefined
        ? undefined
        : Number(body.originalPrice);
    const stock = Number(body.stock);

    if (!Number.isFinite(price) || price < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid price.",
        },
        {
          status: 400,
        }
      );
    }

    if (
      originalPrice !== undefined &&
      (!Number.isFinite(originalPrice) || originalPrice < 0)
    ) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid original price.",
        },
        {
          status: 400,
        }
      );
    }

    if (!Number.isInteger(stock) || stock < 0) {
      return NextResponse.json(
        {
          success: false,
          message: "Stock must be a non-negative whole number.",
        },
        {
          status: 400,
        }
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
        {
          success: false,
          message: "At least one product image URL is required.",
        },
        {
          status: 400,
        }
      );
    }

    const [duplicateProduct, category] = await Promise.all([
      Product.findOne({
        slug,
        _id: {
          $ne: id,
        },
      }).lean(),

      Category.findById(categoryId)
        .select("_id name")
        .lean(),
    ]);

    if (duplicateProduct) {
      return NextResponse.json(
        {
          success: false,
          message: "Another product already uses this slug.",
        },
        {
          status: 409,
        }
      );
    }

    if (!category) {
      return NextResponse.json(
        {
          success: false,
          message: "Selected category was not found.",
        },
        {
          status: 404,
        }
      );
    }

    product.name = name;
    product.slug = slug;
    product.description = description;
    product.price = price;
    product.originalPrice = originalPrice;
    product.category = new Types.ObjectId(categoryId);
    product.brand = brand;
    product.images = images;
    product.stock = stock;
    product.isFeatured = Boolean(body.isFeatured);
    product.isTrending = Boolean(body.isTrending);
    product.isActive = body.isActive ?? true;

    await product.save();

    return NextResponse.json({
      success: true,
      message: "Product updated successfully.",
      data: {
        id: product._id.toString(),
        name: product.name,
        slug: product.slug,
      },
    });
  } catch (error) {
    console.error("Update admin product error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to update product.",
      },
      {
        status:
          error instanceof Error &&
          error.message === "Admin access is required."
            ? 403
            : 500,
      }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: ProductRouteProps
) {
  try {
    await connectDB();
    await requireAdmin();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        {
          success: false,
          message: "Invalid product ID.",
        },
        {
          status: 400,
        }
      );
    }

    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          message: "Product not found.",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    console.error("Delete admin product error:", error);

    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Unable to delete product.",
      },
      {
        status:
          error instanceof Error &&
          error.message === "Admin access is required."
            ? 403
            : 500,
      }
    );
  }
}