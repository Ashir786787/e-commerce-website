import { connectDB } from "@/lib/db";
import {
  createProduct,
  getProducts,
  getProductById,
  getProductBySlug,
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
      "Product created",
      product,
      201
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Could not create product.",
      400
    );
  }
}

export async function getProductsController() {
  try {
    await connectDB();

    const products = await getProducts();

    return successResponse(
      "Products loaded",
      products,
      200
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to load products.",
      500
    );
  }
}

export async function getProductByIdController(id: string) {
  try {
    await connectDB();

    const product = await getProductById(id);

    return successResponse(
      "Product loaded",
      product,
      200
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to fetch product.",
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
      "Product updated",
      product,
      200
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Could not update product.",
      400
    );
  }
}

export async function deleteProductController(id: string) {
  try {
    await connectDB();

    const product = await deleteProduct(id);

    return successResponse(
      "Product deleted",
      product,
      200
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Unable to delete product.",
      400
    );
  }
}

export async function getProductBySlugController(slug: string) {
  try {
    await connectDB();

    const product = await getProductBySlug(slug);

    return successResponse(
      "Product fetched",
      product,
      200
    );
  } catch (error) {
    console.error(error);

    return errorResponse(
      error instanceof Error
        ? error.message
        : "Product not found.",
      404
    );
  }
}