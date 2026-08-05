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

  return messaging.send({
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

  const messaging = getAdminMessaging();

  if (!messaging) {
    return { total, sent: 0, failed };
  }

  for (let i = 0; i < users.length; i += BATCH_SIZE) {
    const batch = users
      .slice(i, i + BATCH_SIZE)
      .map((user) => user.fcmToken)
      .filter((token): token is string => Boolean(token));

    const results = await Promise.allSettled(
      batch.map((token) =>
        messaging.send({
          token,
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
      )
    );

    for (const result of results) {
      if (result.status === "fulfilled") sent++;
      else failed++;
    }
  }

  return { total, sent, failed };
}
