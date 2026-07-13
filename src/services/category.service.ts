import Category from "@/models/Category";
import {
  createCategorySchema,
  type CreateCategoryInput,
} from "@/validations/category.validation";

export async function createCategory(data: CreateCategoryInput) {
  const validatedData = createCategorySchema.parse(data);

  const existingCategory = await Category.findOne({
    $or: [
      { name: validatedData.name },
      { slug: validatedData.slug },
    ],
  });

  if (existingCategory) {
    throw new Error(
      "A category with this name or slug already exists."
    );
  }

  const category = await Category.create(validatedData);

  return category;
}

export async function getCategories() {
  const categories = await Category.find()
    .sort({ createdAt: -1 })
    .lean();

  return categories;
}