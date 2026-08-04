import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";
import { categories as defaultCategories } from "@/data/categories";

const DEFAULT_IMAGE =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb7tmMiL9Bn2X8Iz5teTECetBoux8iSfOPd__XhLC0lw&s=10";

async function fixCategoryImages() {
  try {
    await connectDB();

    const imageBySlug = new Map<string, string>();

    for (const category of defaultCategories) {
      imageBySlug.set(category.slug, category.image);
    }

    if (!imageBySlug.has("home")) {
      const homeCategory = defaultCategories.find((category) => category.slug === "home-living");
      if (homeCategory) {
        imageBySlug.set("home", homeCategory.image);
      }
    }

    const categories = await Category.find({}).lean();

    if (categories.length === 0) {
      console.log("No categories found in the database.");
      process.exit(0);
    }

    let updated = 0;

    for (const category of categories) {
      const currentImage = (category.image || "").trim();

      if (currentImage.startsWith("http")) {
        continue;
      }

      const replacement = imageBySlug.get(category.slug) || DEFAULT_IMAGE;

      await Category.updateOne({ _id: category._id }, { $set: { image: replacement } });

      console.log(
        `Updated "${category.name}" (${category.slug}): ${currentImage || "(empty)"} -> ${replacement}`
      );

      updated++;
    }

    console.log(`\nFixed ${updated} of ${categories.length} categories.`);
  } catch (error) {
    console.error("Failed to fix category images:", error);
  } finally {
    process.exit(0);
  }
}

fixCategoryImages();
