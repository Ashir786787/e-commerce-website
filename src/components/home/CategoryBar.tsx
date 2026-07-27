import Link from "next/link";
import {
  Gem,
  Laptop,
  Home,
  Dumbbell,
  Shirt,
  Sparkles,
} from "lucide-react";
import { categories } from "@/data/categories";

const iconMap: Record<string, React.ElementType> = {
  electronics: Laptop,
  fashion: Shirt,
  "home-living": Home,
  beauty: Sparkles,
  sports: Dumbbell,
  accessories: Gem,
};

export default function CategoryBar() {
  return (
    <section className="border-b bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
        <div className="no-scrollbar flex gap-3 overflow-x-auto">
          {categories.map((category) => {
            const Icon = iconMap[category.slug] || Laptop;
            return (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="flex shrink-0 items-center gap-2 rounded-full border bg-background px-4 py-2.5 text-sm font-medium transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-sm"
              >
                <Icon className="h-4 w-4 text-primary" />
                {category.name}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
