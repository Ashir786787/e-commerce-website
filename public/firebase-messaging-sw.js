importScripts("https://www.gstatic.com/firebasejs/12.3.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.3.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyAsjrVCrEr1_vtEzsB4OvjQCEUFP_AnMMo",
  authDomain: "novacart-fe07e.firebaseapp.com",
  projectId: "novacart-fe07e",
  storageBucket: "novacart-fe07e.firebasestorage.app",
  messagingSenderId: "755388860620",
  appId: "1:755388860620:web:5a7ea84f32c694c16d1a69",
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.data?.title || "NovaCart";
  const options = {
    body: payload.data?.body || "You have a new notification.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: { url: payload.data?.url || "/" },
  };
  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(async (windowClients) => {
      for (const client of windowClients) {
        if ("focus" in client) {
          await client.navigate(url);
          return client.focus();
        }
      }
      return clients.openWindow(url);
    })
  );
});
