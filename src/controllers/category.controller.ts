import { connectDB } from "@/lib/db";
import {
  createCategory,
  getCategories,
} from "@/services/category.service";
import {
  successResponse,
  errorResponse,
} from "@/utils/api-response";

export async function createCategoryController(
  request: Request
) {
  try {
    await connectDB();

    const body = await request.json();
    const category = await createCategory(body);

    return successResponse(
      "Category created successfully.",
      category,
      201
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Something went wrong.",
      400
    );
  }
}

export async function getCategoriesController() {
  try {
    await connectDB();

    const categories = await getCategories();

    return successResponse(
      "Categories fetched successfully.",
      categories,
      200
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Something went wrong.",
      500
    );
  }
}