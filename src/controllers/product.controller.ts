import { connectDB } from "@/lib/db";
import {
  createProduct,
  getProducts,
  getProductById,
  updateProduct,
  deleteProduct,
} from "@/services/product.service";
import {
  successResponse,
  errorResponse,
} from "@/utils/api-response";

export async function createProductController(
  request: Request
) {
  try {
    await connectDB();

    const body = await request.json();
    const product = await createProduct(body);

    return successResponse(
      "Product created successfully.",
      product,
      201
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Failed to create product.",
      400
    );
  }
}

export async function getProductsController() {
  try {
    await connectDB();

    const products = await getProducts();

    return successResponse(
      "Products fetched successfully.",
      products,
      200
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Failed to fetch products.",
      500
    );
  }
}

export async function getProductByIdController(id: string) {
  try {
    await connectDB();

    const product = await getProductById(id);

    return successResponse(
      "Product fetched successfully.",
      product,
      200
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Failed to fetch product.",
      404
    );
  }
}

export async function updateProductController(
  request: Request,
  id: string
) {
  try {
    await connectDB();

    const body = await request.json();

    const product = await updateProduct(id, body);

    return successResponse(
      "Product updated successfully.",
      product,
      200
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Failed to update product.",
      400
    );
  }
}

export async function deleteProductController(id: string) {
  try {
    await connectDB();

    const product = await deleteProduct(id);

    return successResponse(
      "Product deleted successfully.",
      product,
      200
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Failed to delete product.",
      400
    );
  }
}