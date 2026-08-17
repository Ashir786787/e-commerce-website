import mongoose, { Schema, type Document } from "mongoose";

export interface IAiConversationMessage {
  role: "user" | "assistant";
  content: string;
  products?: {
    name: string;
    slug: string;
    price: number;
  }[];
  createdAt: Date;
}

export interface IAiConversation extends Document {
  conversationId: string;
  userId?: mongoose.Types.ObjectId;
  guestId?: string;
  guestName?: string;
  messages: IAiConversationMessage[];
  createdAt: Date;
  lastActiveAt: Date;
}

const AiConversationMessageSchema = new Schema<IAiConversationMessage>(
  {
    role: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    products: [
      {
        name: { type: String },
        slug: { type: String },
        price: { type: Number },
      },
    ],
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const AiConversationSchema = new Schema<IAiConversation>(
  {
    conversationId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    guestId: {
      type: String,
      default: null,
    },
    guestName: {
      type: String,
      default: null,
    },
    messages: {
      type: [AiConversationMessageSchema],
      default: [],
    },
    lastActiveAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

AiConversationSchema.index({ createdAt: -1 });
AiConversationSchema.index({ lastActiveAt: -1 });

export default mongoose.models.AiConversation ||
  mongoose.model<IAiConversation>("AiConversation", AiConversationSchema);
