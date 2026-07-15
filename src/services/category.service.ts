import { Types } from "mongoose";
import Category from "@/models/Category";
import {
  createCategorySchema,
  updateCategorySchema,
  type CreateCategoryInput,
  type UpdateCategoryInput,
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

export async function updateCategory(
  id: string,
  data: UpdateCategoryInput
) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID.");
  }

  const validatedData = updateCategorySchema.parse(data);

  const category = await Category.findById(id);

  if (!category) {
    throw new Error("Category not found.");
  }

  if (validatedData.name || validatedData.slug) {
    const orConditions = [];
    if (validatedData.name) orConditions.push({ name: validatedData.name });
    if (validatedData.slug) orConditions.push({ slug: validatedData.slug });
    const duplicateCategory = await Category.findOne({
      _id: { $ne: id },
      $or: orConditions,
    });

    if (duplicateCategory) {
      throw new Error(
        "A category with this name or slug already exists."
      );
    }
  }

  Object.assign(category, validatedData);

  await category.save();

  return category;
}

export async function deleteCategory(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new Error("Invalid category ID.");
  }

  const category = await Category.findByIdAndDelete(id);

  if (!category) {
    throw new Error("Category not found.");
  }

  return category;
}