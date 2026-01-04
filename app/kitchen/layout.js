// 💡 1. إضافة Metadata Export (تبقى هنا لأن هذا الملف الآن Server Component)
export const metadata = {
  applicationName: "Pizza&Gero Kitchen ",
  title: "Pizza & Gero Kitchen Dashboard", // يمكنك إضافة عنوان للصفحة
  themeColor: "#facc15",
  manifest: "/kitchen-manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Pizza & Gero Kitchen Dashboard",
    // startUpImage: [],
  },
  icons: {
    icon: "/logo.png", // الأيقونات العادية (للويب والمانيفيست)
    apple: "/logo.png", // 💡 الأيقونة الخاصة بـ iOS
  },
};

export default function KitchenLayout({ children }) {
  // 💡 2. لا حاجة لتعديل الـ JSX
  return <div className="min-h-screen bg-gray-900">{children}</div>;
}
