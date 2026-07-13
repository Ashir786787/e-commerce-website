export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviews: number;
  image: string;
  discount?: number;
}

export const trendingProducts: Product[] = [
  {
    id: "1",
    name: "Wireless Noise-Cancelling Headphones",
    category: "Electronics",
    price: 18999,
    originalPrice: 23999,
    rating: 4.8,
    reviews: 128,
    image: "/products/headphones.jpg",
    discount: 21,
  },
  {
    id: "2",
    name: "Premium Smart Watch",
    category: "Accessories",
    price: 12499,
    originalPrice: 14999,
    rating: 4.7,
    reviews: 96,
    image: "/products/smartwatch.jpg",
    discount: 17,
  },
  {
    id: "3",
    name: "Modern Running Shoes",
    category: "Sports",
    price: 8999,
    originalPrice: 10999,
    rating: 4.9,
    reviews: 214,
    image: "/products/shoes.jpg",
    discount: 18,
  },
  {
    id: "4",
    name: "Minimal Leather Backpack",
    category: "Fashion",
    price: 7499,
    rating: 4.6,
    reviews: 82,
    image: "/products/backpack.jpg",
  },
];