import {
  getProductByIdController,
  updateProductController,
  deleteProductController,
} from "@/controllers/product.controller";

interface RouteContext {
  params: Promise<{
    id: string;
  }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const { id } = await context.params;

  return getProductByIdController(id);
}

export async function PUT(
  request: Request,
  context: RouteContext
) {
  const { id } = await context.params;

  return updateProductController(request, id);
}

export async function DELETE(
  _request: Request,
  context: RouteContext
) {
  const { id } = await context.params;

  return deleteProductController(id);
}