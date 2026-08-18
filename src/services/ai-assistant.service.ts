import Product from "@/models/Product";
import Order from "@/models/Order";
import "@/models/Category";
import Category from "@/models/Category";
import "@/models/User";

import { generateContentWithFallback } from "@/lib/gemini";

export interface AIChatMessage {
  role: "user" | "assistant";
  content: string;
}

export interface AIProductSuggestion {
  id: string;
  name: string;
  slug: string;
  price: number;
  originalPrice?: number;
  brand: string;
  stock: number;
  rating: number;
  reviewCount: number;
  image?: string;
  category?: string;
}

interface GenerateAssistantResponseInput {
  message: string;
  userId?: string;
  history?: AIChatMessage[];
}

const PRODUCT_INTENT_KEYWORDS = [
  "show", "find", "search", "recommend", "suggest", "looking for", "buy",
  "purchase", "price", "cheap", "expensive", "discount", "deal", "offer",
  "product", "item", "available", "in stock", "best", "top", "new", "latest",
];

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  "Electronics": ["electronics", "laptop", "phone", "tablet", "headphone", "earphone", "speaker", "camera", "smart", "wireless", "bluetooth", "charger", "watch", "smartwatch", "gadget", "computer", "monitor", "keyboard", "mouse", "gaming"],
  "Fashion": ["fashion", "shirt", "pants", "jeans", "dress", "jacket", "hoodie", "sneakers", "shoes", "clothing", "wear", "outfit", "cap", "hat", "jewelry", "necklace", "ring", "bracelet", "sunglasses"],
  "Home & Living": ["home", "living", "furniture", "decor", "lamp", "chair", "table", "sofa", "bed", "pillow", "blanket", "kitchen", "cookware", "mug", "vase", "candle", "rug", "curtain"],
  "Beauty": ["beauty", "skincare", "cream", "moisturizer", "serum", "cleanser", "sunscreen", "makeup", "lipstick", "mascara", "foundation", "perfume", "fragrance", "cologne", "deodorant", "shampoo", "conditioner", "soap", "lotion", "cosmetic"],
  "Sports": ["sports", "fitness", "gym", "yoga", "running", "exercise", "workout", "dumbbell", "protein", "athletic", "sport", "training", "outdoor", "camping", "hiking", "cycling"],
  "Accessories": ["accessories", "bag", "backpack", "wallet", "belt", "watch", "strap", "case", "cover", "stand", "holder", "adapter", "cable", "mount"],
};

function isProductRelatedQuery(message: string): boolean {
  const lower = message.toLowerCase();

  if (lower.length <= 15) {
    const greetings = ["hi", "hello", "hey", "thanks", "thank you", "ok", "okay", "yes", "no", "sure", "help", "bye", "good morning", "good evening", "how are you", "what can you do"];
    if (greetings.some((g) => lower === g || lower.startsWith(g))) {
      return false;
    }
  }

  const nonProductKeywords = [
    "contact", "team", "human", "agent", "person", "speak", "talk",
    "order status", "my order", "track order", "where is my",
    "refund", "return", "cancel", "complaint", "problem", "issue",
    "payment", "charged", "delivery", "shipping",
    "account", "password", "login", "signup", "verify",
    "policy", "policies", "terms", "privacy",
  ];
  if (nonProductKeywords.some((kw) => lower.includes(kw))) {
    return false;
  }

  for (const keywords of Object.values(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return true;
    }
  }

  if (PRODUCT_INTENT_KEYWORDS.some((kw) => lower.includes(kw))) {
    return true;
  }

  return false;
}

function detectCategoryIntent(message: string): string | null {
  const lower = message.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lower.includes(keyword)) {
        return category;
      }
    }
  }
  return null;
}

async function getRelevantProducts(message: string) {
  const categoryIntent = detectCategoryIntent(message);

  if (categoryIntent) {
    const matchingCategory = await Category.findOne({
      name: categoryIntent,
      isActive: true,
    })
      .select("_id name")
      .lean();

    if (matchingCategory) {
      return Product.find({
        isActive: true,
        category: matchingCategory._id,
      })
        .populate("category", "name")
        .select("name slug price originalPrice brand stock rating reviewCount images category")
        .sort({ isFeatured: -1, isTrending: -1, rating: -1 })
        .limit(6)
        .lean();
    }
  }

  const terms = message
    .trim()
    .split(/\s+/)
    .filter((term) => term.length > 2)
    .slice(0, 6);

  if (terms.length === 0) {
    return [];
  }

  const regex = new RegExp(terms.join("|"), "i");

  const matchingCategories = await Category.find({
    name: regex,
    isActive: true,
  })
    .select("_id name")
    .lean();

  const categoryIds = matchingCategories.map((c) => c._id);

  const orConditions: Record<string, unknown>[] = [
    { name: regex },
    { brand: regex },
  ];

  if (categoryIds.length > 0) {
    orConditions.push({ category: { $in: categoryIds } });
  }

  return Product.find({
    isActive: true,
    $or: orConditions,
  })
    .populate("category", "name")
    .select("name slug price originalPrice brand stock rating reviewCount images category")
    .limit(6)
    .lean();
}

async function getUserOrderContext(userId?: string) {
  if (!userId) {
    return [];
  }

  return Order.find({
    user: userId,
  })
    .select(
      "orderNumber orderStatus paymentStatus total paymentMethod createdAt deliveredAt"
    )
    .sort({
      createdAt: -1,
    })
    .limit(5)
    .lean();
}

export async function generateAssistantResponse({
  message,
  userId,
  history = [],
}: GenerateAssistantResponseInput) {
  const wantsProducts = isProductRelatedQuery(message);

  const [products, orders] = await Promise.all([
    wantsProducts ? getRelevantProducts(message) : Promise.resolve([]),
    getUserOrderContext(userId),
  ]);

  const productContext =
    products.length > 0
      ? products
          .map((product) => {
            const category = product.category as unknown as {
              name?: string;
            };

            return `${product.name} by ${product.brand} (${category?.name || "?"}) - Rs.${product.price}${product.originalPrice ? ` (was Rs.${product.originalPrice})` : ""} | Stock: ${product.stock} | Rating: ${product.rating}/5 | /products/${product.slug}`;
          })
          .join("\n")
      : wantsProducts
        ? "NO matching products found."
        : "Not a product query. Do NOT suggest products.";

  const orderContext =
    orders.length > 0
      ? orders
          .map(
            (order) => `#${order.orderNumber} | ${order.orderStatus} | ${order.paymentStatus} | Rs.${order.total}`
          )
          .join("\n")
      : userId
        ? "No recent orders."
        : "User not authenticated.";

  const conversationHistory = history
    .slice(-5)
    .map(
      (item) =>
        `${item.role === "user" ? "Customer" : "Assistant"}: ${item.content}`
    )
    .join("\n");

  const systemInstruction = `NovaCart AI assistant. PKR currency. Categories: Electronics, Fashion, Home & Living, Beauty, Sports, Accessories. Payment: COD, Bank Transfer, Stripe.

RULES:
- Be concise (2-3 sentences max).
- Only recommend products from the PRODUCT CONTEXT. Never suggest unrelated products.
- If "Not a product query" → answer directly, no products.
- If "NO matching products found" → say so honestly.
- For contact/team requests: direct to support chat.
- For refunds, complaints, payment issues, delivery problems, or "speak to a human" → start with [ESCALATE] then a brief polite message. No products.
- Never reveal other users' orders or internal details.`;

  const prompt = `${conversationHistory ? conversationHistory + "\n\n" : ""}PRODUCTS: ${productContext}

ORDERS: ${orderContext}

CUSTOMER: ${message}`;

  const response = await generateContentWithFallback({
    contents: prompt,
    systemInstruction,
    temperature: 0.3,
    maxOutputTokens: 1024,
    thinkingBudget: 256,
  });

  const replyText =
    response.text?.trim() || "I'm sorry, I couldn't generate a response.";

  let escalate = false;
  let reply = replyText;

  if (replyText.startsWith("[ESCALATE]")) {
    escalate = true;
    reply = replyText.replace("[ESCALATE]", "").trim();
  }

  const shouldIncludeProducts = wantsProducts && products.length > 0 && !escalate;

  return {
    reply,
    escalate,
    products: shouldIncludeProducts
      ? products.map((product) => {
          const images = product.images as unknown as
            | { url: string }[]
            | undefined;
          const category = product.category as unknown as { name?: string };

          return {
            id: product._id.toString(),
            name: product.name,
            slug: product.slug,
            price: product.price,
            originalPrice: product.originalPrice,
            brand: product.brand,
            stock: product.stock,
            rating: product.rating,
            reviewCount: product.reviewCount,
            image: images?.[0]?.url,
            category: category?.name,
          };
        })
      : [],
  };
}
