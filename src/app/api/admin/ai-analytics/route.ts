import { NextRequest, NextResponse } from "next/server";

import { connectDB } from "@/lib/db";
import { requireAdmin } from "@/lib/admin";
import AiConversation from "@/models/AiConversation";

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    await connectDB();

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get("conversationId");

    if (conversationId) {
      const conversation = await AiConversation.findOne({ conversationId })
        .select("conversationId guestName userId messages createdAt lastActiveAt")
        .lean();

      if (!conversation) {
        return NextResponse.json(
          { success: false, message: "Conversation not found." },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: { conversation },
      });
    }

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const [totalConversations, todayConversations, totalMessages, recentConversations] =
      await Promise.all([
        AiConversation.countDocuments(),
        AiConversation.countDocuments({ createdAt: { $gte: todayStart } }),
        AiConversation.aggregate([
          { $project: { count: { $size: "$messages" } } },
          { $group: { _id: null, total: { $sum: "$count" } } },
        ]),
        AiConversation.find()
          .sort({ lastActiveAt: -1 })
          .limit(50)
          .select("conversationId guestName userId messages createdAt lastActiveAt")
          .lean(),
      ]);

    const avgMessages =
      totalConversations > 0
        ? Math.round(
            ((totalMessages[0]?.total as number) || 0) / totalConversations
          )
        : 0;

    const topicMap = new Map<string, number>();

    for (const conv of recentConversations) {
      for (const msg of conv.messages) {
        if (msg.role !== "user") continue;
        const words = msg.content
          .toLowerCase()
          .split(/\s+/)
          .filter((w: string) => w.length > 3 && !STOP_WORDS.has(w));

        for (const word of words) {
          topicMap.set(word, (topicMap.get(word) || 0) + 1);
        }
      }
    }

    const topTopics = [...topicMap.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([topic, count]) => ({ topic, count }));

    const formattedConversations = recentConversations.map((conv) => {
      const firstUserMsg = conv.messages.find((m: { role: string }) => m.role === "user");
      return {
        id: conv.conversationId,
        name: conv.guestName || "Logged-in user",
        messageCount: conv.messages.length,
        firstMessage: firstUserMsg?.content || "",
        createdAt: conv.createdAt,
        lastActiveAt: conv.lastActiveAt,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalConversations,
          todayConversations,
          totalMessages: (totalMessages[0]?.total as number) || 0,
          avgMessagesPerConversation: avgMessages,
        },
        topTopics,
        conversations: formattedConversations,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error
            ? error.message
            : "Failed to load AI analytics.",
      },
      { status: 500 }
    );
  }
}

const STOP_WORDS = new Set([
  "this",
  "that",
  "with",
  "from",
  "have",
  "been",
  "were",
  "they",
  "their",
  "what",
  "your",
  "about",
  "would",
  "could",
  "should",
  "there",
  "which",
  "where",
  "these",
  "those",
  "than",
  "some",
  "more",
  "also",
  "just",
  "only",
  "very",
  "into",
]);
