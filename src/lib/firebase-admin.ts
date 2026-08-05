import {
  cert,
  getApps,
  initializeApp,
  type App,
  type ServiceAccount,
} from "firebase-admin/app";
import { getDatabase, type Database } from "firebase-admin/database";
import { getMessaging, type Messaging } from "firebase-admin/messaging";

let cachedAdminApp: App | null | undefined;
let cachedAdminDatabase: Database | null | undefined;
let cachedAdminMessaging: Messaging | null | undefined;

function getFirebaseAdminApp(): App | null {
  if (cachedAdminApp !== undefined) {
    return cachedAdminApp;
  }

  const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    cachedAdminApp = null;
    return null;
  }

  const serviceAccount: ServiceAccount = {
    projectId,
    clientEmail,
    privateKey,
  };

  try {
    cachedAdminApp =
      getApps().length > 0
        ? getApps()[0]
        : initializeApp({
            credential: cert(serviceAccount),
            databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
          });
  } catch {
    cachedAdminApp = null;
  }

  return cachedAdminApp;
}

export function getAdminDatabase(): Database | null {
  if (cachedAdminDatabase !== undefined) {
    return cachedAdminDatabase;
  }

  const app = getFirebaseAdminApp();
  cachedAdminDatabase = app ? getDatabase(app) : null;
  return cachedAdminDatabase;
}

export function getAdminMessaging(): Messaging | null {
  if (cachedAdminMessaging !== undefined) {
    return cachedAdminMessaging;
  }

  const app = getFirebaseAdminApp();
  cachedAdminMessaging = app ? getMessaging(app) : null;
  return cachedAdminMessaging;
}

export default getFirebaseAdminApp;
