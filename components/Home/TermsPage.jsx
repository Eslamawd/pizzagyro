"use client";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import {
  ChevronDown,
  ShieldCheck,
  ScrollText,
  Bell,
  CreditCard,
  RefreshCw,
} from "lucide-react";
import { useState } from "react";

const sections = [
  {
    titleAr: "1. مقدمة الخدمة",
    titleEn: "1. Service Introduction",
    icon: <ScrollText className="w-5 h-5" />,
    contentAr: [
      "أهلاً بك في Pizza & Gyro Party. هذه الشروط تنظم عملية طلب الطعام عبر موقعنا وتضمن لك تجربة ممتازة.",
      "باستخدامك لموقعنا، فأنت توافق على الالتزام بهذه الشروط والأحكام الخاصة بالمطعم.",
    ],
    contentEn: [
      "Welcome to Pizza & Gyro Party. These terms govern your food ordering process and ensure a great experience.",
      "By using our website, you agree to comply with our restaurant's terms and conditions.",
    ],
  },
  {
    titleAr: "2. طلبات الأكل والتخصيص",
    titleEn: "2. Orders & Customization",
    icon: <Bell className="w-5 h-5" />,
    contentAr: [
      "نحن نضمن تحضير البيتزا والجايرو بناءً على التخصيص الذي اخترته (Toppings).",
      "يرجى التأكد من المكونات المختارة قبل إتمام الطلب، حيث يبدأ التحضير فور وصول الطلب للمطبخ.",
      "في حال وجود أي حساسية تجاه مكون معين، يرجى ذكر ذلك في الملاحظات.",
    ],
    contentEn: [
      "We guarantee that your Pizza & Gyro will be prepared based on your chosen customizations.",
      "Please verify your selected toppings before ordering, as prep starts immediately.",
      "If you have food allergies, please specify them in the order notes.",
    ],
  },
  {
    titleAr: "3. سياسة التوصيل والاستلام",
    titleEn: "3. Delivery & Pickup Policy",
    icon: <ShieldCheck className="w-5 h-5" />,
    contentAr: [
      "نسعى لتوصيل الطلبات في غضون 30-45 دقيقة، ولكن قد يختلف الوقت بناءً على ضغط العمل أو المسافة.",
      "يجب تقديم عنوان دقيق ورقم هاتف متاح لضمان وصول الطلب ساخناً وفي الوقت المحدد.",
    ],
    contentEn: [
      "We aim to deliver within 30-45 minutes, though times may vary based on demand or distance.",
      "A precise address and available phone number are required for hot and timely delivery.",
    ],
  },
  {
    titleAr: "4. الدفع والأسعار",
    titleEn: "4. Payments & Pricing",
    icon: <CreditCard className="w-5 h-5" />,
    contentAr: [
      "الأسعار الموضحة تشمل قيمة البيتزا والإضافات المختارة، وقد تضاف رسوم توصيل وضرائب حسب المنطقة.",
      "نقبل الدفع عند الاستلام أو الدفع الإلكتروني عبر الوسائل المتاحة بالموقع.",
    ],
    contentEn: [
      "Prices shown include the pizza and selected modifiers; delivery fees and taxes may apply.",
      "We accept Cash on Delivery (COD) and online payments via available methods.",
    ],
  },
  {
    titleAr: "5. التعديلات والإلغاء",
    titleEn: "5. Modifications & Cancellation",
    icon: <RefreshCw className="w-5 h-5" />,
    contentAr: [
      "يمكن إلغاء الطلب فقط قبل بدء تحضيره في المطبخ.",
      "تحتفظ إدارة المطعم بحق تعديل الأسعار أو قائمة الطعام في أي وقت بناءً على توفر المكونات الطازجة.",
    ],
    contentEn: [
      "Orders can only be canceled before kitchen preparation begins.",
      "The management reserves the right to modify prices or the menu anytime based on ingredient availability.",
    ],
  },
];

export const TermsPage = () => {
  const { lang } = useLanguage();
  const [openIndex, setOpenIndex] = useState(0); // جعل أول قسم مفتوح تلقائياً

  const toggleSection = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen py-24 bg-[#FFFDFB] text-slate-800"
    >
      <div className="max-w-4xl mx-auto px-6">
        {/* Header Section */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-black text-slate-900 mb-4"
          >
            {lang === "ar" ? "شروط " : "Terms of "}
            <span className="text-orange-500">
              {lang === "ar" ? "الخدمة" : "Service"}
            </span>
          </motion.h1>
          <p className="text-slate-500 font-bold uppercase tracking-widest text-sm">
            {lang === "ar"
              ? "آخر تحديث: ديسمبر 2025"
              : "Last Updated: December 2025"}
          </p>
        </div>

        {/* FAQ Style Accordion for Terms */}
        <div className="space-y-4">
          {sections.map((section, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.05 }}
              className={`rounded-[2rem] border-2 transition-all duration-300 overflow-hidden ${
                openIndex === idx
                  ? "border-orange-500 bg-white shadow-xl shadow-orange-100"
                  : "border-slate-100 bg-white"
              }`}
            >
              <button
                onClick={() => toggleSection(idx)}
                className="w-full flex justify-between items-center p-6 text-lg font-black text-slate-800"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2.5 rounded-xl transition-colors ${
                      openIndex === idx
                        ? "bg-orange-500 text-white"
                        : "bg-slate-50 text-slate-400"
                    }`}
                  >
                    {section.icon}
                  </div>
                  <span className="text-start">
                    {lang === "ar" ? section.titleAr : section.titleEn}
                  </span>
                </div>
                <ChevronDown
                  className={`w-6 h-6 transition-transform duration-300 ${
                    openIndex === idx
                      ? "rotate-180 text-orange-600"
                      : "text-slate-300"
                  }`}
                />
              </button>

              <motion.div
                initial={false}
                animate={{
                  height: openIndex === idx ? "auto" : 0,
                  opacity: openIndex === idx ? 1 : 0,
                }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 pt-2">
                  <ul className="space-y-3 border-t border-orange-50 pt-4">
                    {(lang === "ar"
                      ? section.contentAr
                      : section.contentEn
                    ).map((line, i) => (
                      <li
                        key={i}
                        className="flex gap-3 text-slate-600 font-medium leading-relaxed"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2.5 shrink-0" />
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
