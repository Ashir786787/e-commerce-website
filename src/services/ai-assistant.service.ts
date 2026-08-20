import Product from "@/models/Product";
import Order from "@/models/Order";
import "@/models/Category";
import Category from "@/models/Category";
import "@/models/User";

import { generateContentWithFallback } from "@/lib/gemini";
import { createNotificationSafe } from "@/services/notification.service";
import { ADMIN_NOTIFICATION_KEY } from "@/types/Notification";

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
  "gift", "present", "budget", "under", "below", "within", "around", "over",
  "affordable", "cost", "spend", "worth",
];

const GIFT_KEYWORDS = [
  "gift", "present", "birthday", "anniversary", "wedding", "holiday",
  "christmas", "valentine", "mother", "father", "wife", "husband",
  "friend", "brother", "sister", "parent", "kid", "child", "baby",
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

  if (isGiftQuery(lower)) {
    return true;
  }

  if (extractPriceFilter(message).max !== undefined || extractPriceFilter(message).min !== undefined) {
    return true;
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

function extractPriceFilter(message: string): { max?: number; min?: number } {
  const lower = message.toLowerCase();
  let max: number | undefined;
  let min: number | undefined;

  const underMatch = lower.match(/(?:under|below|within|less than|max|up to|cheaper than)\s*(?:rs\.?|pkr|rupees)?\s*([\d,]+)/);
  if (underMatch) {
    max = parseInt(underMatch[1].replace(/,/g, ""), 10);
  }

  const overMatch = lower.match(/(?:over|above|more than|min|at least|greater than)\s*(?:rs\.?|pkr|rupees)?\s*([\d,]+)/);
  if (overMatch) {
    min = parseInt(overMatch[1].replace(/,/g, ""), 10);
  }

  const rangeMatch = lower.match(/(?:rs\.?|pkr|rupees)?\s*([\d,]+)\s*(?:to|-)\s*(?:rs\.?|pkr|rupees)?\s*([\d,]+)/);
  if (rangeMatch && !max && !min) {
    min = parseInt(rangeMatch[1].replace(/,/g, ""), 10);
    max = parseInt(rangeMatch[2].replace(/,/g, ""), 10);
  }

  if (!max && !min) {
    const bareNumber = lower.match(/(?:rs\.?|pkr|rupees)\s*([\d,]+)/);
    if (bareNumber) {
      const val = parseInt(bareNumber[1].replace(/,/g, ""), 10);
      if (lower.includes("under") || lower.includes("below") || lower.includes("budget")) {
        max = val;
      } else if (lower.includes("over") || lower.includes("above")) {
        min = val;
      }
    }
  }

  return { max, min };
}

function isGiftQuery(message: string): boolean {
  const lower = message.toLowerCase();
  return GIFT_KEYWORDS.some((kw) => lower.includes(kw));
}

async function getRelevantProducts(message: string) {
  const lower = message.toLowerCase();
  const categoryIntent = detectCategoryIntent(message);
  const priceFilter = extractPriceFilter(message);
  const hasPriceFilter = priceFilter.max !== undefined || priceFilter.min !== undefined;

  const terms = lower
    .trim()
    .split(/\s+/)
    .filter((t) => t.length > 2 && !["show", "find", "search", "recommend", "suggest", "looking", "buy", "purchase", "give", "me", "the", "for", "some", "any", "good", "best", "cheap", "affordable"].includes(t))
    .slice(0, 6);

  if (terms.length > 0) {
    const nameRegex = new RegExp(terms.join("|"), "i");

    const baseFilter: Record<string, unknown> = { isActive: true, name: nameRegex };
    if (hasPriceFilter) {
      const priceCondition: Record<string, number> = {};
      if (priceFilter.max !== undefined) priceCondition.$lte = priceFilter.max;
      if (priceFilter.min !== undefined) priceCondition.$gte = priceFilter.min;
      baseFilter.price = priceCondition;
    }

    const specificProducts = await Product.find(baseFilter)
      .populate("category", "name")
      .select("name slug price originalPrice brand stock rating reviewCount images category isFeatured isTrending")
      .sort({ isFeatured: -1, isTrending: -1, rating: -1, price: 1 })
      .limit(8)
      .lean();

    if (specificProducts.length > 0) {
      return specificProducts;
    }
  }

  if (categoryIntent) {
    const matchingCategory = await Category.findOne({
      name: categoryIntent,
      isActive: true,
    }).select("_id name").lean();

    if (matchingCategory) {
      const categoryFilter: Record<string, unknown> = { isActive: true, category: matchingCategory._id };
      if (hasPriceFilter) {
        const priceCondition: Record<string, number> = {};
        if (priceFilter.max !== undefined) priceCondition.$lte = priceFilter.max;
        if (priceFilter.min !== undefined) priceCondition.$gte = priceFilter.min;
        categoryFilter.price = priceCondition;
      }

      const categoryProducts = await Product.find(categoryFilter)
        .populate("category", "name")
        .select("name slug price originalPrice brand stock rating reviewCount images category isFeatured isTrending")
        .sort({ isFeatured: -1, isTrending: -1, rating: -1, price: 1 })
        .limit(8)
        .lean();

      if (categoryProducts.length > 0) {
        return categoryProducts;
      }
    }
  }

  if (hasPriceFilter || isGiftQuery(message)) {
    const fallbackFilter: Record<string, unknown> = { isActive: true, stock: { $gt: 0 } };

    if (priceFilter.max !== undefined) {
      fallbackFilter.price = { $lte: priceFilter.max };
    }

    const fallbackProducts = await Product.find(fallbackFilter)
      .populate("category", "name")
      .select("name slug price originalPrice brand stock rating reviewCount images category isFeatured isTrending")
      .sort({ isFeatured: -1, isTrending: -1, rating: -1 })
      .limit(8)
      .lean();

    if (fallbackProducts.length > 0) {
      return fallbackProducts;
    }

    const cheapestProducts = await Product.find({ isActive: true, stock: { $gt: 0 } })
      .populate("category", "name")
      .select("name slug price originalPrice brand stock rating reviewCount images category isFeatured isTrending")
      .sort({ price: 1, rating: -1 })
      .limit(6)
      .lean();

    if (cheapestProducts.length > 0) {
      return cheapestProducts;
    }
  }

  return Product.find({ isActive: true, stock: { $gt: 0 } })
    .populate("category", "name")
    .select("name slug price originalPrice brand stock rating reviewCount images category isFeatured isTrending")
    .sort({ isFeatured: -1, isTrending: -1, rating: -1 })
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

  const priceFilter = extractPriceFilter(message);
  const priceContext = priceFilter.max !== undefined || priceFilter.min !== undefined
    ? `\nUSER PRICE FILTER: ${priceFilter.min ? `min Rs.${priceFilter.min}` : ""}${priceFilter.min && priceFilter.max ? " to " : ""}${priceFilter.max ? `max Rs.${priceFilter.max}` : ""}`
    : "";

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
        ? "NO matching products found in our catalog."
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
- Be concise (2-4 sentences max).
- Only recommend products from the PRODUCT CONTEXT. Never invent or suggest products not listed.
- The PRODUCT CONTEXT already contains relevant products for the user's query. Only talk about those products.
- If the user asks for a specific item (e.g. "headphones"), only recommend headphones from the context — do not recommend unrelated items like laptops, keyboards, or mice even if they appear in the context.
- Pick 2-3 best matches from the context that directly match what the user asked for. Include name, price, and a brief reason. Always include the link.
- At the end, you may briefly mention: "We also have other categories like [X, Y] if you're interested." — but only as a short note, not as product recommendations.
- If "NO matching products found" → suggest the user try a different price range or browse categories. Offer to escalate to a human agent.
- If "Not a product query" → answer directly, no products.
- For gift questions: recommend based on the products shown, mention who the gift is suitable for.
- For price questions: highlight the best value options from the products shown.
- ESCALATION FLOW (contacting the team):
  Step 1 — When the user first asks to contact the team, speak to a human, get support, or has a complaint/refund/payment/delivery issue: Ask for the reason. Say something like "I'd be happy to connect you! Could you tell me the reason for contacting our team?" Do NOT use [ESCALATE] yet.
  Step 2 — If the conversation history shows you already asked for a reason and the user now provides it (e.g. "order issue", "refund", "delivery problem", or any reason): Start your reply with [REASON: their reason text] then a warm message like "Thanks! I've shared this with our support team. A team member will reach out to you shortly. Is there anything else I can help with?" Do NOT use [ESCALATE].
  Only use [ESCALATE] if the user insists on speaking to a human immediately without giving a reason, or if the conversation has gone back and forth more than 3 times on the same support topic.
- Never reveal other users' orders or internal details.
- Always be helpful and conversational, not robotic.
- Do NOT be over-smart or pushy. If the user asks for one thing, show that one thing. Don't flood them with unrelated suggestions.`;

  const prompt = `${conversationHistory ? conversationHistory + "\n\n" : ""}PRODUCTS: ${productContext}${priceContext}

ORDERS: ${orderContext}

CUSTOMER: ${message}`;

  const response = await generateContentWithFallback({
    contents: prompt,
    systemInstruction,
    temperature: 0.3,
    maxOutputTokens: 1024,
  });

  const replyText =
    response.text?.trim() || "I'm sorry, I couldn't generate a response.";

  let escalate = false;
  let reply = replyText;
  let reason: string | null = null;

  const reasonMatch = replyText.match(/^\[REASON:\s*(.+?)\]/);
  if (reasonMatch) {
    reason = reasonMatch[1].trim();
    reply = replyText.replace(reasonMatch[0], "").trim();

    const conversationSummary = history
      .slice(-8)
      .map(
        (item) =>
          `${item.role === "user" ? "Customer" : "AI"}: ${item.content}`
      )
      .join("\n");

    void createNotificationSafe({
      targetKey: ADMIN_NOTIFICATION_KEY,
      type: "chat",
      title: "Customer contact request",
      body: `Reason: ${reason}\n\nConversation history:\n${conversationSummary}`,
      link: "/admin/messages",
    });
  } else if (replyText.startsWith("[ESCALATE]")) {
    escalate = true;
    reply = replyText.replace("[ESCALATE]", "").trim();

    const conversationSummary = history
      .slice(-8)
      .map(
        (item) =>
          `${item.role === "user" ? "Customer" : "AI"}: ${item.content}`
      )
      .join("\n");

    void createNotificationSafe({
      targetKey: ADMIN_NOTIFICATION_KEY,
      type: "chat",
      title: "User requesting human support",
      body: `A user asked to speak with a team agent.\n\nConversation history:\n${conversationSummary}`,
      link: "/admin/messages",
    });
  }

  const shouldIncludeProducts = wantsProducts && products.length > 0 && !escalate;

  return {
    reply,
    escalate,
    reason,
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
