export interface FrontendProduct {
  _id: string;
  name: string;
  slug: string;
  description: string;

  price: number;
  originalPrice?: number;

  brand: string;

  images: {
    url: string;
    publicId?: string;
  }[];

  category: {
    _id: string;
    name: string;
    slug: string;
    image: string;
  };

  stock: number;

  sold: number;

  rating: number;

  reviewCount: number;

  isFeatured: boolean;

  isTrending: boolean;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;
}