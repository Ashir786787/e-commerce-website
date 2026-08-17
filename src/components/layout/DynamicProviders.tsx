"use client";

import dynamic from "next/dynamic";

const ForegroundNotificationListener = dynamic(
  () => import("@/components/notifications/ForegroundNotificationListener"),
  { ssr: false }
);

const FirebaseServiceWorkerRegistrar = dynamic(
  () => import("@/components/notifications/FirebaseServiceWorkerRegistrar"),
  { ssr: false }
);

export default function DynamicProviders() {
  return (
    <>
      <FirebaseServiceWorkerRegistrar />
      <ForegroundNotificationListener />
    </>
  );
}
