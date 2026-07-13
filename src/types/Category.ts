import { Types } from "mongoose";

export interface ICategory {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
