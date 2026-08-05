import { getApp, getApps, initializeApp, type FirebaseApp } from "firebase/app";
import { getDatabase, type Database } from "firebase/database";

let cachedApp: FirebaseApp | null | undefined;
let cachedDatabase: Database | null | undefined;

function buildFirebaseConfig() {
  return {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  };
}

export function getFirebaseApp(): FirebaseApp | null {
  if (cachedApp !== undefined) {
    return cachedApp;
  }

  const config = buildFirebaseConfig();
  const configMissing = Object.values(config).some((value) => !value);

  if (configMissing) {
    cachedApp = null;
    return null;
  }

  try {
    cachedApp = getApps().length > 0 ? getApp() : initializeApp(config);
  } catch {
    cachedApp = null;
  }

  return cachedApp;
}

export function getFirebaseDatabase(): Database | null {
  if (cachedDatabase !== undefined) {
    return cachedDatabase;
  }

  const app = getFirebaseApp();

  if (!app) {
    cachedDatabase = null;
    return null;
  }

  try {
    cachedDatabase = getDatabase(app);
  } catch {
    cachedDatabase = null;
  }

  return cachedDatabase;
}

export default getFirebaseApp;
