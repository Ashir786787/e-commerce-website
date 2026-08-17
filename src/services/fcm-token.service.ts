import User from "@/models/User";
import { getAdminMessaging } from "@/lib/firebase-admin";

export async function saveFCMToken(
  userId: string,
  fcmToken: string
) {
  if (!userId) {
    throw new Error("User ID is required.");
  }

  if (!fcmToken?.trim()) {
    throw new Error("FCM token is required.");
  }

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        fcmToken: fcmToken.trim(),
      },
    },
    {
      new: true,
      runValidators: true,
    }
  ).select("_id email fcmToken");

  if (!user) {
    throw new Error("User not found.");
  }

  return {
    id: user._id.toString(),
    email: user.email,
    tokenSaved: Boolean(user.fcmToken),
  };
}

interface SendPushNotificationInput {
  userId: string;
  title: string;
  body: string;
  url?: string;
}

export async function sendPushNotification({
  userId,
  title,
  body,
  url = "/",
}: SendPushNotificationInput) {
  const user = await User.findById(userId)
    .select("fcmToken")
    .lean();

  if (!user) {
    throw new Error("User not found.");
  }

  if (!user.fcmToken) {
    throw new Error(
      "This user has not enabled notifications."
    );
  }

  const messaging = getAdminMessaging();

  if (!messaging) {
    throw new Error(
      "Firebase Admin is not configured."
    );
  }

  try {
    const result = await messaging.send({
      token: user.fcmToken,
      data: {
        title,
        body,
        url,
      },
      webpush: {
        headers: {
          Urgency: "high",
        },
      },
    });

    return result;
  } catch (error: unknown) {
    const code =
      error && typeof error === "object" && "code" in error
        ? (error as { code: string }).code
        : "";

    if (
      code === "messaging/registration-token-not-registered" ||
      code === "messaging/invalid-registration-token"
    ) {
      await User.findByIdAndUpdate(userId, {
        $set: { fcmToken: "" },
      });
    }

    throw error;
  }
}

interface SendPushNotificationToManyInput {
  title: string;
  body: string;
  url?: string;
}

export async function sendPushNotificationToMany({
  title,
  body,
  url = "/",
}: SendPushNotificationToManyInput) {
  const messaging = getAdminMessaging();

  if (!messaging) {
    return {
      total: 0,
      sent: 0,
      failed: 0,
      error: "Firebase Admin is not configured. Check FIREBASE_ADMIN_* env vars.",
    };
  }

  const users = await User.find({ fcmToken: { $ne: "" } })
    .select("fcmToken")
    .lean();

  const total = users.length;

  if (total === 0) {
    return { total, sent: 0, failed: 0 };
  }

  const BATCH_SIZE = 50;

  let sent = 0;
  let failed = 0;
  const failedUserIds: string[] = [];

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users
      .slice(i, i + BATCH_SIZE)
      .filter((user) => Boolean(user.fcmToken));

    const results = await Promise.allSettled(
      batch.map((user) =>
        messaging
          .send({
            token: user.fcmToken!,
            data: {
              title,
              body,
              url,
            },
            webpush: {
              headers: {
                Urgency: "high",
              },
            },
          })
          .then(() => ({ userId: user._id.toString(), success: true }))
          .catch((error: unknown) => {
            const code =
              error && typeof error === "object" && "code" in error
                ? (error as { code: string }).code
                : "";

            const isTokenError =
              code === "messaging/registration-token-not-registered" ||
              code === "messaging/invalid-registration-token";

            return {
              userId: user._id.toString(),
              success: false,
              isTokenError,
            };
          })
      )
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        if (result.value.success) {
          sent++;
        } else {
          failed++;
          failedUserIds.push(result.value.userId);
        }
      } else {
        failed++;
      }
    }
  }

  if (failedUserIds.length > 0) {
    await User.updateMany(
      { _id: { $in: failedUserIds } },
      { $set: { fcmToken: "" } }
    );
  }

  return { total, sent, failed };
}
