"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";

function Counter({ start, minStep, maxStep, interval, label }) {
  const [count, setCount] = useState(start);

  useEffect(() => {
    const timer = setInterval(() => {
      const randomStep =
        Math.floor(Math.random() * (maxStep - minStep + 1)) + minStep;
      setCount((prev) => prev + randomStep);
    }, interval);

    return () => clearInterval(timer);
  }, [minStep, maxStep, interval]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="p-6 rounded-2xl shadow-lg text-center border border-gray-700"
    >
      <h3 className="text-4xl font-bold animate-gradient bg-gradient-to-r from-emerald-400 via-red-400 to-blue-500 bg-clip-text text-transparent bg-[length:200%_200%]">
        {count.toLocaleString()}
      </h3>
      <p className="text-gray-300">{label}</p>
    </motion.div>
  );
}

function UsersCounterSection() {
  const { lang } = useLanguage();
  return (
    <section className=" pt-16">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        <h2 className="text-3xl md:text-4xl font-bold text-center text-white mb-12 font-cairo">
          {lang === "ar" ? "أرقام QR EGY اليوم" : "Today's QR EGY Numbers"}
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          <Counter
            start={250}
            minStep={1}
            maxStep={3}
            interval={3000}
            label={lang === "ar" ? "مطاعم مسجلة" : "Registered Restaurants"}
          />
          <Counter
            start={1200}
            minStep={5}
            maxStep={15}
            interval={2500}
            label={lang === "ar" ? "طلبات يومية" : "Daily Orders"}
          />
          <Counter
            start={4800}
            minStep={10}
            maxStep={20}
            interval={2000}
            label={lang === "ar" ? "عملاء يستخدمون المنيو" : "Active Customers"}
          />
        </div>
      </div>
    </section>
  );
}

export default UsersCounterSection;
