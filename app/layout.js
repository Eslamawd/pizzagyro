import "./globals.css";
import Providers from "@/components/layout/Providers";
import { Poppins, Tajawal } from "next/font/google";
import Script from "next/script";

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["200", "300", "400", "500", "700", "800", "900"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  display: "swap",
});

export const metadata = {
  applicationName: "Pizza & Gyro Party",
  title: "Pizza & Gyro Party | Premium Smart Menu",
  description:
    "Order the best Pizza and Mediterranean Gyro in town. Fully customize your meal with our smart digital menu.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pizza & Gyro Party",
  },
  other: {
    "preconnect-api": {
      rel: "preconnect",
      href: "https://api.qregy.com", // Keeping your API endpoint
      crossOrigin: "anonymous",
    },
  },
  icons: {
    icon: "/logo.png", // Ensure you have your logo here
    apple: "/logo.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html dir="rtl" lang="en">
      <body
        className={`${poppins.variable} ${tajawal.variable} antialiased font-tajawal bg-[#FAFAFA]`}
      >
        {/* ✅ PWA Script for offline support */}
        <Script src="/pwa.js" strategy="afterInteractive" />

        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
