"use client";

import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { BarChart3, Building2, CreditCard, LogOut, Users } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/Card";
import { useLanguage } from "@/context/LanguageContext";
import { useEffect } from "react";

export default function DashboardLayout({ children }) {
  const { lang } = useLanguage();
  const { logout, user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push("/");
    } else if (!user.verified) {
      router.push("/send-verified");
    }
  }, [user, router]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/");
    } catch (err) {
      console.error("فشل تسجيل الخروج:", err);
    }
  };

  const menuItems = [
    {
      icon: BarChart3,
      href: "/dashboard",
      label: lang === "ar" ? "لوحة المعلومات" : "Dashboard",
    },
    {
      icon: Building2,
      href: "/dashboard/restaurants",
      label: lang === "ar" ? "المطاعم" : "Restaurants",
    },
    {
      icon: Users,
      href: "/dashboard/customers",
      label: lang === "ar" ? "العملاء" : "Customers",
    },
  ];

  if (!user) return null;

  return (
    <motion.div
      dir={lang === "ar" ? "rtl" : "ltr"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="container mt-16 py-8"
    >
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
        </h1>
        <Button onClick={handleLogout} variant="destructive">
          <LogOut />
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
        {/* Sidebar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="md:col-span-1"
        >
          <Card>
            <CardContent className="p-6 space-y-2">
              {menuItems.map(({ icon: Icon, href, label }) => (
                <Link className="m-1 block" key={href} href={href}>
                  <Button
                    variant="ghost"
                    className="flex items-center gap-2 w-full justify-start text-gray-700 hover:bg-primary/10 hover:text-primary"
                  >
                    <Icon className="h-5 w-5" />
                    {label}
                  </Button>
                </Link>
              ))}
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <main className="md:col-span-4">{children}</main>
      </div>
    </motion.div>
  );
}
