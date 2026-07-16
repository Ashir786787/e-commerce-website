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

export async function getProductsController(
  request: Request
) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || undefined;
    const category = searchParams.get("category") || undefined;
    const brand = searchParams.get("brand") || undefined;
    const featuredParam = searchParams.get("featured");
    const trendingParam = searchParams.get("trending");

    const featured =
      featuredParam === null
        ? undefined
        : featuredParam === "true"
          ? true
          : featuredParam === "false"
            ? false
            : undefined;

    const trending =
      trendingParam === null
        ? undefined
        : trendingParam === "true"
          ? true
          : trendingParam === "false"
            ? false
            : undefined;

    if (
      featuredParam !== null &&
      featuredParam !== "true" &&
      featuredParam !== "false"
    ) {
      return errorResponse(
        "Featured must be either true or false.",
        400
      );
    }

    if (
      trendingParam !== null &&
      trendingParam !== "true" &&
      trendingParam !== "false"
    ) {
      return errorResponse(
        "Trending must be either true or false.",
        400
      );
    }

    const minPriceParam = searchParams.get("minPrice");
    const maxPriceParam = searchParams.get("maxPrice");

    const minPrice =
      minPriceParam !== null ? Number(minPriceParam) : undefined;

    const maxPrice =
      maxPriceParam !== null ? Number(maxPriceParam) : undefined;

    if (
      (minPrice !== undefined && Number.isNaN(minPrice)) ||
      (maxPrice !== undefined && Number.isNaN(maxPrice))
    ) {
      return errorResponse(
        "Minimum and maximum prices must be valid numbers.",
        400
      );
    }

    if (
      minPrice !== undefined &&
      maxPrice !== undefined &&
      minPrice > maxPrice
    ) {
      return errorResponse(
        "Minimum price cannot be greater than maximum price.",
        400
      );
    }

    const products = await getProducts({
      search,
      category,
      brand,
      minPrice,
      maxPrice,
      featured,
      trending,
    });

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
        : "Something went wrong.",
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