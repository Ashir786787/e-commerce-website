import { connectDB } from "@/lib/db";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "@/services/category.service";
import { successResponse, errorResponse } from "@/utils/api-response";

export async function createCategoryController(request: Request) {
  try {
    await connectDB();
    const body = await request.json();
    const category = await createCategory(body);
    return successResponse("Category created", category, 201);
  } catch (error) {
    console.error(error);
    return errorResponse(
      error instanceof Error ? error.message : "Could not create category.",
      400
    );
  }
}

export async function getCategoriesController() {
  try {
    await connectDB();
    const categories = await getCategories();
    return successResponse("Categories loaded", categories, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(
      error instanceof Error ? error.message : "Unable to load categories.",
      500
    );
  }
}

export async function updateCategoryController(request: Request, id: string) {
  try {
    await connectDB();
    const body = await request.json();
    const category = await updateCategory(id, body);
    return successResponse("Category updated", category, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(
      error instanceof Error ? error.message : "Unable to update category.",
      400
    );
  }
}

export async function deleteCategoryController(id: string) {
  try {
    await connectDB();
    const category = await deleteCategory(id);
    return successResponse("Category deleted", category, 200);
  } catch (error) {
    console.error(error);
    return errorResponse(
      error instanceof Error ? error.message : "Could not delete category.",
      400
    );
  }
}
