// app/kitchen/layout.js

// تحديد الميتا داتا اللازمة لـ PWA وإعدادات العرض
export const metadata = {
  applicationName: "Pizza & Gero Kashier",
  title: "Pizza & Gero Kashier ",
  description: "Digital Menu System for Restaurants",
  themeColor: "#facc15", // لون الثيم
  // 💡 الأهم: إضافة رابط ملف Manifest
  manifest: "/cashier-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pizza & Gero Kashier",
    // startUpImage: [],
  },
  icons: {
    icon: "/logo.png", // الأيقونات العادية (للويب والمانيفيست)
    apple: "/logo.png", // 💡 الأيقونة الخاصة بـ iOS
  },
};

export default function CashierLayout({ children }) {
  // هنا يمكن إضافة شريط تنقل علوي أو تذييل ثابت، لكن نكتفي بـ children
  return <div className="min-h-screen bg-gray-900">{children}</div>;
}
