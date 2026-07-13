import { Types } from "mongoose";

export interface IProductImage {
  url: string;
  publicId?: string;
}

export interface IProduct {
  name: string;
  slug: string;
  description: string;

  price: number;
  originalPrice?: number;

  category: Types.ObjectId;
  brand: string;

  images: IProductImage[];

  stock: number;
  sold: number;

  rating: number;
  reviewCount: number;

  isFeatured: boolean;
  isTrending: boolean;
  isActive: boolean;

  createdAt?: Date;
  updatedAt?: Date;
}