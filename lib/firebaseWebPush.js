import api from "@/api/axiosClient";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  isSupported,
  onMessage,
} from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const vapidKey = process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY;

function hasFirebaseConfig() {
  return Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    firebaseConfig.appId &&
    vapidKey,
  );
}

async function resolveMessaging() {
  if (typeof window === "undefined") {
    return null;
  }

  if (!hasFirebaseConfig()) {
    return null;
  }

  const supported = await isSupported().catch(() => false);
  if (!supported) {
    return null;
  }

  const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  return getMessaging(app);
}

export async function initFirebaseWebPush(platformLabel = "web") {
  if (typeof window === "undefined") {
    return { enabled: false, reason: "server" };
  }

  if (!("Notification" in window) || !("serviceWorker" in navigator)) {
    return { enabled: false, reason: "unsupported" };
  }

  const messaging = await resolveMessaging();
  if (!messaging) {
    return { enabled: false, reason: "firebase-not-configured" };
  }

  let permission = Notification.permission;
  if (permission === "default") {
    permission = await Notification.requestPermission();
  }

  if (permission !== "granted") {
    return { enabled: false, reason: "permission-denied" };
  }

  const registration =
    (await navigator.serviceWorker.getRegistration(
      "/firebase-messaging-sw.js",
    )) || (await navigator.serviceWorker.register("/firebase-messaging-sw.js"));

  const currentToken = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!currentToken) {
    return { enabled: false, reason: "missing-token" };
  }

  const cacheKey = `firebase-web-push-token-${platformLabel}`;
  const cached = window.localStorage.getItem(cacheKey);

  if (cached !== currentToken) {
    await api().post("/api/mobile/push-token", {
      push_token: currentToken,
      platform: platformLabel,
    });

    window.localStorage.setItem(cacheKey, currentToken);
  }

  return { enabled: true, token: currentToken };
}

export async function subscribeFirebaseForegroundMessages(handler) {
  const messaging = await resolveMessaging();

  if (!messaging) {
    return () => {};
  }

  return onMessage(messaging, handler);
}
