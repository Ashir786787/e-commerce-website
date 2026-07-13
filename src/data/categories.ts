import electronicsImage from "@/assets/images/categories/electronics.jpg";
import fashionImage from "@/assets/images/categories/fashion.jpg";
import homeImage from "@/assets/images/categories/home.jpg";
import beautyImage from "@/assets/images/categories/beauty.jpg";
import sportsImage from "@/assets/images/categories/sports.jpg";
import accessoriesImage from "@/assets/images/categories/accessories.jpg";

export type CategoryItem = {
  id: number;
  name: string;
  slug: string;
  image: typeof electronicsImage;
};

export const categories: CategoryItem[] = [
  {
    id: 1,
    name: "Electronics",
    slug: "electronics",
    image: electronicsImage,
  },
  {
    id: 2,
    name: "Fashion",
    slug: "fashion",
    image: fashionImage,
  },
  {
    id: 3,
    name: "Home & Living",
    slug: "home-living",
    image: homeImage,
  },
  {
    id: 4,
    name: "Beauty",
    slug: "beauty",
    image: beautyImage,
  },
  {
    id: 5,
    name: "Sports",
    slug: "sports",
    image: sportsImage,
  },
  {
    id: 6,
    name: "Accessories",
    slug: "accessories",
    image: accessoriesImage,
  },
];