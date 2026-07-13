import { Types } from "mongoose";

export interface IProduct {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  price: number;
  discountPrice?: number;
  category: string;
  brand: string;
  images: string[];
  thumbnail: string;
  stock: number;
  sku: string;
  rating: number;
  numReviews: number;
  featured: boolean;
  isActive: boolean;
  tags: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
