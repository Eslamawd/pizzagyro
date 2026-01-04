// @ts-check
import withPWAInit from "@ducanh2912/next-pwa";

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {},
};

const withPWA = withPWAInit({
  dest: "public",
  // يجب أن يكون true للإنتاج، و false للتطوير لتجنب مشاكل الكاش
  disable: process.env.NODE_ENV === "development",
  register: true, // تسجيل Service Worker تلقائياً
  skipWaiting: true, // تحديث Service Worker فوراً
});

export default withPWA(nextConfig);
