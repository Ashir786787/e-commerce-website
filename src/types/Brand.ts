import { Types } from "mongoose";

export interface IBrand {
  _id?: Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  website?: string;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}
