import { Suspense } from "react";
import SiteHeader from "@/components/layout/SiteHeader";
import SiteFooter from "@/components/layout/SiteFooter";
import { connectDB } from "@/lib/db";
import Category from "@/models/Category";

async function getCategories() {
  try {
    await connectDB();
    const categories = await Category.find({ isActive: true })
      .sort({ name: 1 })
      .lean();
    return categories.map((c) => ({
      id: c._id.toString(),
      name: c.name,
      slug: c.slug,
    }));
  } catch {
    return [];
  }
}

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const categories = await getCategories();

  return (
    <div className="flex min-h-screen flex-col">
      <div className="print:hidden">
        <Suspense>
          <SiteHeader categories={categories} />
        </Suspense>
      </div>
      <main className="flex-1">{children}</main>
      <div className="print:hidden">
        <SiteFooter />
      </div>
    </div>
  );
}
