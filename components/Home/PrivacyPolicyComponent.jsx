"use client";
import React from "react";
import { motion } from "framer-motion";
import { Info, Shield, CheckCheck, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { Separator } from "../ui/Separator";
import { useLanguage } from "@/context/LanguageContext";

const sectionVariants = {
  hidden: { opacity: 0, y: 50 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const PrivacyPolicyComponent = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const content = {
    title: isAr ? "سياسة الخصوصية" : "Privacy Policy",
    lastUpdated: isAr
      ? "آخر تحديث: 30 ديسمبر 2025"
      : "Last Updated: December 30, 2025",
    intro: isAr
      ? "نحن في Pizza & Gyro Party نلتزم بحماية خصوصية زوارنا وعملائنا. توضح هذه السياسة كيف نتعامل مع معلوماتك عند الطلب عبر موقعنا."
      : "At Pizza & Gyro Party, we are committed to protecting our customers' privacy. This policy explains how we handle your information when ordering through our website.",

    sections: [
      {
        icon: <Info className="h-5 w-5 text-orange-500" />,
        title: isAr ? "1. المعلومات التي نجمعها" : "1. Information We Collect",
        desc: isAr
          ? "نجمع البيانات اللازمة لتوصيل طلباتك وتحسين تجربتك:"
          : "We collect data necessary to deliver your orders and improve your experience:",
        items: isAr
          ? [
              "الاسم، العنوان، ورقم الهاتف للتوصيل.",
              "تاريخ الطلبات والأصناف المفضلة لديك.",
              "معلومات الجهاز والمتصفح لتحسين أداء الموقع.",
            ]
          : [
              "Name, address, and phone number for delivery.",
              "Order history and your favorite items.",
              "Device and browser information to optimize site performance.",
            ],
      },
      {
        icon: <CheckCheck className="h-5 w-5 text-green-500" />,
        title: isAr ? "2. كيف نستخدم معلوماتك" : "2. How We Use Your Info",
        desc: isAr
          ? "نستخدم بياناتك للأغراض التالية فقط:"
          : "We use your data strictly for the following purposes:",
        items: isAr
          ? [
              "تجهيز وتوصيل طلبات الطعام الخاصة بك.",
              "إرسال عروض حصرية وخصومات (بموافقتك).",
              "تحسين جودة قائمة الطعام لدينا بناءً على طلباتكم.",
            ]
          : [
              "Processing and delivering your food orders.",
              "Sending exclusive offers and discounts (with your consent).",
              "Improving our menu quality based on your preferences.",
            ],
      },
      {
        icon: <Lock className="h-5 w-5 text-blue-500" />,
        title: isAr ? "3. أمن البيانات والدفع" : "3. Data Security & Payments",
        desc: isAr
          ? "نحن لا نخزن بيانات بطاقات الائتمان. يتم معالجة جميع المدفوعات عبر بوابات دفع عالمية مشفرة وآمنة."
          : "We do not store credit card details. All payments are processed through secure, encrypted global payment gateways.",
        items: [],
      },
    ],
    footer: isAr
      ? "لأي استفسارات بخصوص خصوصيتك، يرجى التواصل معنا عبر:"
      : "For any privacy-related questions, please contact us at:",
  };

  return (
    <motion.div
      className="min-h-screen mt-8 py-16 px-4 flex justify-center"
      dir={isAr ? "rtl" : "ltr"}
      variants={sectionVariants}
      initial="hidden"
      animate="show"
    >
      <Card className="w-full max-w-3xl border-none shadow-2xl shadow-orange-100 rounded-[2.5rem] overflow-hidden">
        <CardHeader className="bg-slate-900 text-white p-10 space-y-4">
          <CardTitle className="text-4xl font-black flex items-center gap-4">
            <Shield className="h-10 w-10 text-orange-500" />
            {content.title}
          </CardTitle>
          <p className="text-slate-400 font-medium">{content.lastUpdated}</p>
        </CardHeader>

        <CardContent className="p-8 md:p-12 space-y-10 text-slate-700">
          <p className="text-lg leading-relaxed font-medium text-slate-500 border-l-4 border-orange-500 px-4">
            {content.intro}
          </p>

          {content.sections.map((section, index) => (
            <div key={index} className="space-y-4">
              <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                {section.icon}
                {section.title}
              </h2>
              <p className="font-medium">{section.desc}</p>
              {section.items.length > 0 && (
                <ul className={`space-y-2 ${isAr ? "pr-8" : "pl-8"}`}>
                  {section.items.map((item, i) => (
                    <li
                      key={i}
                      className="list-disc text-slate-600 tracking-wide"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              )}
              {index !== content.sections.length - 1 && (
                <Separator className="mt-8 opacity-50" />
              )}
            </div>
          ))}

          <div className="pt-10 border-t border-slate-100 text-center">
            <p className="text-slate-500 font-bold mb-2">{content.footer}</p>
            <a
              href="mailto:privacy@pizzagyroparty.com"
              className="text-orange-600 font-black text-xl hover:underline"
            >
              privacy@pizzagyroparty.com
            </a>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default PrivacyPolicyComponent;
