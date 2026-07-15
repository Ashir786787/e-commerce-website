import {
  createProductController,
  getProductsController,
} from "@/controllers/product.controller";

export async function POST(request: Request) {
  return createProductController(request);
}

export async function GET(request: Request) {
  return getProductsController(request);
}