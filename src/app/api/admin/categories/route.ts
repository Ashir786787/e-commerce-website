import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { getCurrentUser } from "@/services/auth.service";

type CreateCategoryBody = {
  name?: string;
  slug?: string;
  description?: string;
  image?: string;
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
  const user = await getCurrentUser();

  if (!user || user.role !== "admin") {
    throw new Error("Admin access is required.");
  }
}

export async function GET() {
  try {
    await connectDB();
    await requireAdmin();

    const categories = await Category.find()
      .sort({ createdAt: -1 })
      .lean();

    const data = await Promise.all(
      categories.map(async (category) => ({
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: category.image || "",
        isActive: category.isActive,
        productCount: await Product.countDocuments({
          category: category._id,
        }),
        createdAt: category.createdAt,
      }))
    );

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to load categories.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status:
          message === "Admin access is required."
            ? 403
            : 500,
      }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    await requireAdmin();

    const body =
      (await request.json()) as CreateCategoryBody;

    const name = body.name?.trim();
    const slug = normalizeSlug(
      body.slug || body.name || ""
    );
    const description =
      body.description?.trim() || "";
    const image = body.image?.trim() || "";

    if (!name || name.length < 2) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Category name must contain at least 2 characters.",
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
          message: "A valid category slug is required.",
        },
        {
          status: 400,
        }
      );
    }

    if (description.length > 500) {
      return NextResponse.json(
        {
          success: false,
          message:
            "Description cannot exceed 500 characters.",
        },
        {
          status: 400,
        }
      );
    }

    const escapedName = name.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&"
    );

    const existingCategory =
      await Category.findOne({
        $or: [
          {
            name: {
              $regex: `^${escapedName}$`,
              $options: "i",
            },
          },
          {
            slug,
          },
        ],
      }).lean();

    if (existingCategory) {
      return NextResponse.json(
        {
          success: false,
          message:
            "A category with this name or slug already exists.",
        },
        {
          status: 409,
        }
      );
    }

    const category = await Category.create({
      name,
      slug,
      description,
      image,
      isActive: body.isActive ?? true,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Category created successfully.",
        data: {
          id: category._id.toString(),
          name: category.name,
          slug: category.slug,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Create category error:", error);

    const message =
      error instanceof Error
        ? error.message
        : "Unable to create category.";

    return NextResponse.json(
      {
        success: false,
        message,
      },
      {
        status:
          message === "Admin access is required."
            ? 403
            : 500,
      }
    );
  }
}
