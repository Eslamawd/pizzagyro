"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Star, Quote } from "lucide-react";

function TestimonialsCarousel() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const testimonials = [
    {
      text_ar:
        "أفضل بيتزا جربتها في المنطقة! ميزة إني أقدر أشيل وأزود المكونات بنفسي من الموبايل خلت التجربة ممتازة والطلب وصل سخن جداً.",
      text_en:
        "Best pizza in town! The ability to customize my toppings directly from my phone made it a great experience. It arrived piping hot.",
      name_ar: "سارة جونسون",
      name_en: "Sarah Johnson",
      role_ar: "عميل دائم",
      role_en: "Regular Customer",
      rating: 5,
    },
    {
      text_ar:
        "الجايرو عندهم طعمه أصلي جداً والتتبيلة رائعة. عجبني جداً إن المنيو واضح وسهل الاستخدام والطلب مخدش وقت.",
      text_en:
        "Their Gyro is so authentic and the seasoning is amazing. I loved how clear the digital menu is; ordering was seamless.",
      name_ar: "مايكل ريتشارد",
      name_en: "Michael Richard",
      role_ar: "محب للجايرو",
      role_en: "Gyro Lover",
      rating: 5,
    },
    {
      text_ar:
        "خدمة التوصيل سريعة والبيتزا وصلت زي ما طلبتها بالظبط بالخضروات اللي اخترتها. فعلاً أفضل مكان تطلب منه وأنت مطمن.",
      text_en:
        "Fast delivery and the pizza was exactly as I customized it. Definitely the best place to order from with confidence.",
      name_ar: "ديفيد علي",
      name_en: "David Ali",
      role_ar: "عميل جديد",
      role_en: "New Customer",
      rating: 5,
    },
  ];

  const [index, setIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % testimonials.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [testimonials.length]);

  return (
    <section
      id="testimonials"
      className="relative py-24 overflow-hidden"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* عناصر ديكورية خلفية */}
      <div className="absolute top-10 left-10 text-orange-100 opacity-20 rotate-12">
        <Quote size={120} />
      </div>

      <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
        <motion.h2
          className="text-4xl md:text-6xl font-black text-slate-900 mb-4 tracking-tight"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {isAr ? "كلام " : "Our Happy "}
          <span className="text-orange-500">{isAr ? "زباينا" : "Fans"}</span>
        </motion.h2>

        <p className="text-slate-500 font-bold mb-16 uppercase tracking-widest text-sm">
          {isAr
            ? "آراء حقيقية من ناس جربت طعمنا"
            : "Real reviews from real hungry people"}
        </p>

        <div className="relative min-h-[320px] md:min-h-[280px] flex items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9, x: isAr ? 50 : -50 }}
              animate={{ opacity: 1, scale: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9, x: isAr ? -50 : 50 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="bg-white p-10 md:p-14 rounded-[3rem] shadow-2xl shadow-orange-100 border border-orange-50 max-w-2xl mx-auto relative"
            >
              {/* نجوم التقييم */}
              <div className="flex justify-center gap-1 mb-6">
                {[...Array(testimonials[index].rating)].map((_, i) => (
                  <Star
                    key={i}
                    size={20}
                    className="fill-orange-400 text-orange-400"
                  />
                ))}
              </div>

              <p className="text-xl md:text-2xl text-slate-700 mb-8 leading-relaxed font-bold italic">
                “
                {isAr
                  ? testimonials[index].text_ar
                  : testimonials[index].text_en}
                ”
              </p>

              <div>
                <h4 className="font-black text-slate-900 text-xl">
                  {isAr
                    ? testimonials[index].name_ar
                    : testimonials[index].name_en}
                </h4>
                <span className="text-orange-500 font-bold text-sm uppercase">
                  {isAr
                    ? testimonials[index].role_ar
                    : testimonials[index].role_en}
                </span>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Indicators */}
        <div className="flex justify-center mt-12 gap-3">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-3 rounded-full transition-all duration-300 ${
                i === index
                  ? "w-10 bg-orange-500"
                  : "w-3 bg-slate-200 hover:bg-orange-200"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default TestimonialsCarousel;
