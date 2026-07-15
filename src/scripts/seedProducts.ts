import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import Product from "@/models/Product";
import { sampleProducts } from "@/data/sampleProducts";

async function seedProducts() {
  try {
    await connectDB();

    const categories = await Category.find({ isActive: true });
    if (categories.length === 0) {
      console.error("No categories found. Seed categories first.");
      process.exit(1);
    }

    const categoryMap = new Map(
      categories.map((c) => [c.slug, c._id])
    );

    const products = sampleProducts.map(({ categorySlug, image, ...rest }) => {
      const categoryId = categoryMap.get(categorySlug);

      if (!categoryId) {
        console.error(`Category slug "${categorySlug}" not found.`);
        process.exit(1);
      }

      return {
        ...rest,
        category: categoryId,
        images: [{ url: image, publicId: "" }],
        sold: 0,
        rating: 0,
        reviewCount: 0,
        isActive: true,
      };
    });

    await Product.deleteMany({});
    await Product.insertMany(products);

    console.log(`Seeded ${products.length} products successfully.`);
    process.exit(0);
  } catch (error) {
    console.error("Failed to seed products:", error);
    process.exit(1);
  }
}

seedProducts();
