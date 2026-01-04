"use client";
import React from "react";
import { useLanguage } from "@/context/LanguageContext"; // تأكد من استيراد السياق
import {
  FaPizzaSlice,
  FaHeart,
  FaUtensils,
  FaSmileBeam,
  FaAward,
} from "react-icons/fa";
import { motion } from "framer-motion";

function AboutPage() {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const values = [
    {
      titleAr: "مكونات طازجة يومياً",
      titleEn: "Fresh Ingredients Daily",
      descAr:
        "في Pizza & Gyro Party، نؤمن أن السر يبدأ من العجين. نجهز عجينة البيتزا وسلطات الجايرو طازجة كل صباح لضمان أعلى جودة.",
      descEn:
        "At Pizza & Gyro Party, we believe the secret starts with the dough. We prepare our pizza dough and gyro salads fresh every morning.",
      icon: <FaPizzaSlice className="w-8 h-8 text-orange-500" />,
    },
    {
      titleAr: "شغف بالخدمة",
      titleEn: "Passion for Service",
      descAr:
        "هدفنا ليس فقط إطعامك، بل رسم ابتسامة على وجهك. خدمتنا سريعة، ودودة، ومصممة لتجعلك تشعر وكأنك في بيتك.",
      descEn:
        "Our goal isn't just to feed you, but to put a smile on your face. Our service is fast, friendly, and designed to make you feel at home.",
      icon: <FaHeart className="w-8 h-8 text-red-500" />,
    },
    {
      titleAr: "التخصيص هو الملك",
      titleEn: "Customization is King",
      descAr:
        "نحن أول من يمنحك التحكم الكامل. عبر نظامنا الرقمي، يمكنك تصميم وجبتك كما تحب تماماً، قطعة بقطعة.",
      descEn:
        "We give you full control. Through our digital system, you can design your meal exactly as you like, piece by piece.",
      icon: <FaUtensils className="w-8 h-8 text-green-500" />,
    },
    {
      titleAr: "فخورون بخدمتكم",
      titleEn: "Proud to Serve You",
      descAr:
        "من قلب فروعنا، نقدم مزيجاً فريداً من المطبخ الإيطالي والجايرو اليوناني بلمسة عصرية تناسب الجميع.",
      descEn:
        "From the heart of our branches, we offer a unique blend of Italian cuisine and Greek Gyro with a modern touch.",
      icon: <FaAward className="w-8 h-8 text-yellow-500" />,
    },
  ];

  return (
    <div
      className="min-h-screen  py-24 text-slate-900"
      dir={isAr ? "rtl" : "ltr"}
    >
      <div className="max-w-6xl mx-auto px-6">
        {/* --- Header Section --- */}
        <header className="text-center mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <span className="text-orange-600 font-bold text-sm tracking-[0.3em] uppercase mb-4 block">
              {isAr ? "قصتنا" : "Our Story"}
            </span>
            <h1 className="text-5xl md:text-7xl font-black mb-8 text-slate-900 tracking-tight">
              {isAr ? "أكثر من مجرد " : "More than just a "}
              <span className="text-orange-500">
                {isAr ? "مطعم" : "Restaurant"}
              </span>
            </h1>
            <p className="text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed font-medium">
              {isAr
                ? "بدأنا بفكرة بسيطة: دمج أفضل ما في المطبخ الإيطالي والشرقي في مكان واحد، مع جعل عملية الطلب سهلة وممتعة."
                : "We started with a simple idea: blending the best of Italian and Mediterranean cuisine in one place, while making the ordering process easy and fun."}
            </p>
          </motion.div>
        </header>

        {/* --- Content Section --- */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center mb-32">
          <motion.div
            initial={{ opacity: 0, x: isAr ? 50 : -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <div className="aspect-square bg-orange-100 rounded-[3rem] overflow-hidden relative rotate-3 group hover:rotate-0 transition-transform duration-500 shadow-xl">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&q=80')] bg-cover bg-center group-hover:scale-110 transition-transform duration-700"></div>
              <div className="absolute inset-0 bg-gradient-to-t from-orange-500/40 to-transparent"></div>
              <div className="absolute bottom-8 left-8 text-white" dir="ltr">
                <p className="text-4xl font-black">Since 2020</p>
                <p className="font-bold opacity-90 tracking-widest">
                  CRAFTING HAPPINESS
                </p>
              </div>
            </div>
            <div
              className={`absolute -bottom-6 ${
                isAr ? "-left-6" : "-right-6"
              } w-32 h-32 bg-green-500 rounded-full flex items-center justify-center -rotate-12 shadow-xl border-4 border-white`}
            >
              <FaSmileBeam className="text-white text-5xl" />
            </div>
          </motion.div>

          <div className="space-y-10">
            <h2 className="text-4xl font-black text-slate-900 leading-tight">
              {isAr ? "ما الذي يجعل طعمنا " : "What makes our taste "} <br />
              <span className="text-orange-500 underline decoration-green-500 decoration-wavy underline-offset-8">
                {isAr ? "لا يُنسى؟" : "Unforgettable?"}
              </span>
            </h2>
            <div className="grid grid-cols-1 gap-8">
              {values.map((val, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex gap-6"
                >
                  <div className="w-14 h-14 bg-white shadow-lg shadow-orange-100 rounded-2xl flex items-center justify-center shrink-0">
                    {val.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-black mb-2">
                      {isAr ? val.titleAr : val.titleEn}
                    </h3>
                    <p className="text-slate-500 font-medium leading-relaxed">
                      {isAr ? val.descAr : val.descEn}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* --- Stats Section --- */}
        <section className="bg-slate-900 rounded-[3rem] p-12 md:p-20 text-white relative overflow-hidden mb-32">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl"></div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-12 text-center relative z-10">
            {[
              { val: "50k+", labelAr: "بيتزا", labelEn: "Pizzas" },
              { val: "12+", labelAr: "سنوات خبرة", labelEn: "Years Exp" },
              { val: "100%", labelAr: "حلال", labelEn: "Halal" },
              { val: "4.9", labelAr: "تقييم", labelEn: "Rating" },
            ].map((stat, i) => (
              <div key={i}>
                <p className="text-5xl font-black text-orange-500 mb-2">
                  {stat.val}
                </p>
                <p className="text-slate-400 font-bold uppercase text-sm tracking-widest">
                  {isAr ? stat.labelAr : stat.labelEn}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* --- CTA Section --- */}
        <section className="text-center bg-orange-500 p-12 md:p-20 rounded-[4rem] shadow-2xl shadow-orange-200 relative">
          <h2 className="text-4xl md:text-5xl font-black mb-6 text-white leading-tight">
            {isAr ? "هل أنت جائع؟" : "Are you hungry?"} <br />
            {isAr ? "دعنا نبدأ الحفلة الآن!" : "Let’s start the party!"}
          </h2>
          <p className="text-xl mb-10 text-white/90 font-bold">
            {isAr
              ? "اطلب الآن واستمتع بأفضل وجبة تصلك حتى الباب."
              : "Order now and enjoy the best meal delivered to your door."}
          </p>
          <button className="bg-white text-orange-500 px-12 py-4 rounded-full font-black text-xl hover:scale-105 transition-transform shadow-xl">
            {isAr ? "تصفح المنيو الآن" : "Browse Menu Now"}
          </button>
        </section>
      </div>
    </div>
  );
}

export default AboutPage;
