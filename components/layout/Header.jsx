"use client";
import {
  User,
  LogOut,
  Settings,
  Globe2,
  Menu,
  ShoppingCart,
} from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { useOrder } from "@/context/OrderContext";

export const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const { lang, toggleLang } = useLanguage();

  const { currency, setCurrency } = useCurrency();
  const { user, logout } = useAuth();

  return (
    <motion.div
      dir={lang === "ar" ? "rtl" : "ltr"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="bg-[#0f1020] text-gray-900 w-full relative"
    >
      <header className="fixed top-0 left-0 right-0 pb-2 z-50 backdrop-blur-md rounded-b-4xl shadow-lg shadow-emerald-500/5">
        <div className="mx-auto max-w-7xl px-4 pt-2 flex items-center justify-between">
          {/* Logo */}
          <Link href={"/"} className="flex items-center gap-3">
            <img
              src="/geros.png"
              alt="Pizza & Gyro Party"
              className=" w-45 h-20 object-cover "
            />
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-6 text-sm text-gray-300">
            {[
              { href: "/#how", ar: "آلية العمل", en: "How It Works" },
              { href: "/#features", ar: "المميزات", en: "Features" },
              { href: "/#faq", ar: "الأسئلة الشائعة", en: "FAQ" },
              { href: "/contact", ar: "التواصل", en: "Contact" },
            ].map((link, i) => (
              <Link
                key={i}
                href={link.href}
                className="relative nav-link hover:text-white transition"
              >
                {lang === "ar" ? link.ar : link.en}
              </Link>
            ))}
          </nav>

          {/* Buttons */}
          <div className="flex items-center gap-3">
            {/* Language Toggle */}
            <span
              onClick={toggleLang}
              className="flex items-center gap-1 px-2 py-1 rounded-full border border-gray-600 hover:border-gray-400 text-sm transition cursor-pointer"
            >
              {lang === "ar" ? "EN" : "AR"}
            </span>

            {/* Admin / Dashboard */}
            {user && user.role === "admin" && (
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-xl hidden md:block border border-gray-600 hover:border-gray-400 transition"
              >
                {lang === "ar" ? "لوحة التحكم" : "Dashboard"}
              </Link>
            )}

            {user ? (
              <>
                {/* ✅ Cart Button */}
                <div className="relative">
                  <Link
                    href={"/delivry/orders"}
                    className=" p-1 justify-center text-center rounded-fullhover:scale-105"
                  >
                    <ShoppingCart className="h-8 w-8 text-orange-500" />
                  </Link>

                  {/* Red Counter */}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 hidden md:block rounded-xl border border-gray-600 hover:border-gray-400 transition"
                >
                  {lang === "ar" ? "تسجيل الدخول" : "Login"}
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-2 md:px-4 md:py-2 rounded-xl text-sm bg-gradient-to-l from-orange-400 to-yellow-400 text-[#0f1020] font-semibold shadow-md hover:shadow-lg hover:shadow-emerald-500/30 hover:scale-105 transition"
                >
                  {lang === "ar" ? "سجل الآن" : "Register"}
                </Link>
              </>
            )}

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <span onClick={() => setMenuOpen(!menuOpen)}>
                <Menu className="w-8 h-8 text-black" />
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              key="menu"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ duration: 0.3 }}
              className="fixed top-0 right-0 h-full w-2/3 bg-[#181a2a] shadow-xl p-6 z-50 md:hidden flex flex-col gap-4"
            >
              {user?.role === "admin" && (
                <Button
                  onClick={() => setMenuOpen(false)}
                  className="justify-between"
                >
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center gap-2 w-full"
                  >
                    <Settings className="w-4 h-4" />
                    {lang === "ar" ? "الإدارة" : "Dashboard"}
                  </Link>
                </Button>
              )}

              {user ? (
                <>
                  <Button onClick={() => logout()} className="justify-center">
                    <div className="flex items-center justify-center gap-2 w-full">
                      <LogOut className="w-4 h-4" />
                      {lang === "ar" ? "تسجيل " : "LogOut"}
                    </div>
                  </Button>
                </>
              ) : (
                <Button
                  onClick={() => setMenuOpen(false)}
                  className="justify-center"
                >
                  <Link
                    href={"/login"}
                    className="flex items-center justify-center gap-2 w-full"
                  >
                    <User className="w-4 h-4" />
                    {lang === "ar" ? "تسجيل الدخول" : "Login"}
                  </Link>
                </Button>
              )}

              {/* Other Links */}
              <Button className="w-full">
                <Link href="/about" onClick={() => setMenuOpen(false)}>
                  {lang === "ar" ? "عنّا" : "About Us"}
                </Link>
              </Button>
            </motion.div>

            {/* Overlay */}
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.3 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="fixed inset-0 bg-black z-40 md:hidden"
              onClick={() => setMenuOpen(false)}
            ></motion.div>
          </>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
