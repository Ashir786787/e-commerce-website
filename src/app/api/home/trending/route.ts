import { NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import "@/models/Category";
import Product from "@/models/Product";

export async function GET() {
  try {
    await connectDB();

    const products = await Product.find({
      isTrending: true,
      isActive: true,
    })
      .populate("category", "name slug")
      .sort({ createdAt: -1, _id: -1 })
      .limit(6)
      .lean();

    const formatted = products.map((product) => ({
      id: product._id.toString(),
      slug: product.slug,
      name: product.name,
      price: product.price,
      originalPrice: product.originalPrice,
      image: product.images[0]?.url || "",
      category:
        product.category && typeof product.category === "object" && "name" in product.category
          ? (product.category as { name: string }).name
          : "",
      rating: product.rating,
      reviews: product.reviewCount,
      discount:
        product.originalPrice && product.originalPrice > product.price
          ? Math.round(
              ((product.originalPrice - product.price) /
                product.originalPrice) *
                100
            )
          : 0,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch {
    return NextResponse.json(
      { success: false, message: "Failed to load trending products." },
      { status: 500 }
    );
  }
}
