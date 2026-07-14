import {
  updateCategoryController,
  deleteCategoryController,
} from "@/controllers/category.controller";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  const { id } = await context.params;

  return updateCategoryController(request, id);
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  const { id } = await context.params;

  return deleteCategoryController(id);
}