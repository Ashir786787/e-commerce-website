import { getProductBySlugController } from "@/controllers/product.controller";

interface RouteContext {
  params: Promise<{
    slug: string;
  }>;
}

export async function GET(
  _request: Request,
  context: RouteContext
) {
  const { slug } = await context.params;

  return getProductBySlugController(slug);
}