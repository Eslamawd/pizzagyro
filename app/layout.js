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
  metadataBase: new URL("https://pizzagyropartyrestaurant.com"),
  keywords: [
    "Pizza & Gyro Party",
    "Pizza Menu",
    "Mediterranean Gyro",
    "Smart Digital Menu",
    "Online Food Ordering",
    "Customizable Meals",
    "Food Delivery",
  ],
  manifest: "/manifest.json",

  openGraph: {
    title: "Pizza & Gyro Party",
    description: "Order the best Pizza and Mediterranean Gyro in town",
    url: "https://pizzagyropartyrestaurant.com",
    type: "website",
    images: [
      {
        url: "/geros.png", // تأكد إن الصورة دي في فولدر public ومساحتها معقولة
        width: 1200,
        height: 1200,
        alt: "Pizza & Gyro Logo",
      },
    ],
  },

  // 3. عشان يظهر بشكل شيك في تويتر/X
  twitter: {
    card: "summary_large_image",
    images: ["/geros.png"],
  },

  icons: {
    icon: "/geros.png",
    apple: "/geros.png",
  },

  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Pizza & Gyro Party",
  },
  other: {
    "preconnect-api": {
      rel: "preconnect",
      href: "https://api.pizzagyropartyrestaurant.com", // Keeping your API endpoint
      crossOrigin: "anonymous",
    },
  },
  icons: {
    icon: "/geros.png", // Ensure you have your logo here
    apple: "/geros.png",
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
