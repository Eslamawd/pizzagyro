"use client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import Link from "next/link";
import Image from "next/image";

const Hero = () => {
  const { lang } = useLanguage();

  return (
    <section className="relative min-h-screen pt-24 pb-5 mt-0 overflow-hidden">
      {/* Decorative pizza-style pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" />

      <div className="container mt-0 mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto mb-12">
          {/* Brand Logo Placeholder */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="mb-0 mt-0"
          >
            {/* استبدل المسار بشعار المطعم الحقيقي */}
            <img
              src="geros.png"
              alt="Pizza & Gyro Party"
              className="  w-70 h-70 m-0 "
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tight mt-0 text-slate-900 mb-4 leading-[1.1]"
          >
            {lang === "ar" ? (
              <>
                تذوق <span className="text-orange-600">الشغف</span> في كل قطمة
              </>
            ) : (
              <>
                Taste the <span className="text-orange-600">Passion</span> in
                Every Bite
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600 mb-10 max-w-2xl font-medium"
          >
            {lang === "ar"
              ? "بيتزا نيويورك الأصلية وجايرو البحر المتوسط الطازج، الآن بين يديك بلمسة واحدة."
              : "Authentic New York-style pizza and fresh Mediterranean gyro, now just one click away."}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 w-full justify-center items-center"
          >
            <Link href="/delivry">
              <Button
                size="lg"
                className="w-full sm:w-64 px-8 h-16 bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold rounded-2xl transition-all shadow-xl shadow-orange-200"
              >
                {lang === "ar" ? "اطلب الآن" : "Order Now"}
                <ArrowRight className="ml-2 h-6 w-6" />
              </Button>
            </Link>
            <Link href="/deals">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-64 px-8 h-16 text-xl font-bold rounded-2xl border-2 border-green-600 text-green-700 hover:bg-green-50 transition-all"
              >
                {lang === "ar" ? "شاهد العروض" : "View Specials"}
              </Button>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
