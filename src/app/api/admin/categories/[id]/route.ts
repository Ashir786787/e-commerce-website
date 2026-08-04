import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";

import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { getCurrentUser } from "@/services/auth.service";

interface CategoryRouteProps {
  params: Promise<{
    id: string;
  }>;
}

type UpdateCategoryBody = {
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
  const currentUser = await getCurrentUser();

  if (!currentUser || currentUser.role !== "admin") {
    throw new Error("Admin access is required.");
  }

  return currentUser;
}

export async function GET(_request: NextRequest, { params }: CategoryRouteProps) {
  try {
    await connectDB();
    await requireAdmin();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid category ID." },
        { status: 400 }
      );
    }

    const category = await Category.findById(id).lean();

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found." },
        { status: 404 }
      );
    }

    const productCount = await Product.countDocuments({ category: category._id });

    return NextResponse.json({
      success: true,
      data: {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description || "",
        image: category.image || "",
        isActive: category.isActive,
        productCount,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
    });
  } catch (error) {
    console.error("Load admin category error:", error);

    const message = error instanceof Error ? error.message : "Unable to load category.";

    return NextResponse.json(
      { success: false, message },
      { status: message === "Admin access is required." ? 403 : 500 }
    );
  }
}

export async function PATCH(request: NextRequest, { params }: CategoryRouteProps) {
  try {
    await connectDB();
    await requireAdmin();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid category ID." },
        { status: 400 }
      );
    }

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found." },
        { status: 404 }
      );
    }

    const body = (await request.json()) as UpdateCategoryBody;

    const name = body.name?.trim();
    const slug = normalizeSlug(body.slug || body.name || category.slug);
    const description = body.description?.trim() || "";
    const image = body.image?.trim() || "";

    if (!name || name.length < 2) {
      return NextResponse.json(
        { success: false, message: "Category name must contain at least 2 characters." },
        { status: 400 }
      );
    }

    if (!slug) {
      return NextResponse.json(
        { success: false, message: "A valid category slug is required." },
        { status: 400 }
      );
    }

    if (description.length > 500) {
      return NextResponse.json(
        { success: false, message: "Description cannot exceed 500 characters." },
        { status: 400 }
      );
    }

    const duplicateCategory = await Category.findOne({
      _id: { $ne: id },
      $or: [
        { name: { $regex: `^${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, $options: "i" } },
        { slug },
      ],
    }).lean();

    if (duplicateCategory) {
      return NextResponse.json(
        { success: false, message: "Another category already uses this name or slug." },
        { status: 409 }
      );
    }

    category.name = name;
    category.slug = slug;
    category.description = description;
    category.image = image;
    category.isActive = body.isActive ?? category.isActive;

    await category.save();

    return NextResponse.json({
      success: true,
      message: "Category updated successfully.",
      data: {
        id: category._id.toString(),
        name: category.name,
        slug: category.slug,
        description: category.description,
        image: category.image,
        isActive: category.isActive,
      },
    });
  } catch (error) {
    console.error("Update admin category error:", error);

    const message = error instanceof Error ? error.message : "Unable to update category.";

    return NextResponse.json(
      { success: false, message },
      { status: message === "Admin access is required." ? 403 : 500 }
    );
  }
}

export async function DELETE(_request: NextRequest, { params }: CategoryRouteProps) {
  try {
    await connectDB();
    await requireAdmin();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { success: false, message: "Invalid category ID." },
        { status: 400 }
      );
    }

    const category = await Category.findById(id);

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Category not found." },
        { status: 404 }
      );
    }

    const productCount = await Product.countDocuments({ category: category._id });

    if (productCount > 0) {
      return NextResponse.json(
        {
          success: false,
          message: `This category contains ${productCount} product${productCount === 1 ? "" : "s"}. Move or delete those products before deleting the category.`,
        },
        { status: 409 }
      );
    }

    await category.deleteOne();

    return NextResponse.json({
      success: true,
      message: "Category deleted successfully.",
    });
  } catch (error) {
    console.error("Delete admin category error:", error);

    const message = error instanceof Error ? error.message : "Unable to delete category.";

    return NextResponse.json(
      { success: false, message },
      { status: message === "Admin access is required." ? 403 : 500 }
    );
  }
}
