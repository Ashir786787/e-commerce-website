import {
  createCategoryController,
  getCategoriesController,
} from "@/controllers/category.controller";

export async function POST(request: Request) {
  return createCategoryController(request);
}

export async function GET() {
  return getCategoriesController();
}