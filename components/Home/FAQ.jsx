"use client";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Minus, HelpCircle, Pizza, Clock, MapPin } from "lucide-react";

const faqs = [
  {
    question_ar: "هل يمكنني إضافة أو إزالة مكونات من البيتزا؟",
    answer_ar:
      "طبعاً! 🍕 نظامنا مصمم خصيصاً للتخصيص. تقدر تختار 'Build Your Own' وتضيف اللي تحبه من الجبن والخضروات واللحوم، أو تعدل على أي صنف موجود في المنيو.",
    question_en: "Can I add or remove toppings from my pizza?",
    answer_en:
      "Absolutely! 🍕 Our system is built for customization. You can choose 'Build Your Own' to add your favorites or modify any existing item on the menu.",
    icon: <Pizza className="w-5 h-5 text-orange-500" />,
  },
  {
    question_ar: "كم يستغرق توصيل الطلب؟",
    answer_ar:
      "هدفنا هو السرعة! ⚡ الطلبات داخل النطاق تأخذ من 30 إلى 45 دقيقة، والبيتزا بتوصلك سخنة كأنها لسه طالعة من الفرن.",
    question_en: "How long does delivery take?",
    answer_en:
      "Speed is our goal! ⚡ Orders within range typically take 30-45 minutes, ensuring your pizza arrives hot and fresh from the oven.",
    icon: <Clock className="w-5 h-5 text-green-600" />,
  },
  {
    question_ar: "هل اللحوم المستخدمة حلال؟",
    answer_ar:
      "نعم، جميع اللحوم (الجايرو، البيبروني، واللحم البقري) لدينا حلال 100% ومذبوحة طبقاً للشريعة الإسلامية.",
    question_en: "Is the meat used Halal?",
    answer_en:
      "Yes, all our meats (Gyro, Pepperoni, and Beef) are 100% Halal and prepared according to Islamic guidelines.",
    icon: <HelpCircle className="w-5 h-5 text-orange-500" />,
  },
  {
    question_ar: "أين تقع فروعكم؟",
    answer_ar:
      "نحن موجودون لخدمتكم في أمريكا في عدة مواقع. تقدر تشوف أقرب فرع ليك من خلال خريطة الموقع في صفحة 'Contact'.",
    question_en: "Where are you located?",
    answer_en:
      "We are located across several US locations. You can find the nearest branch using the map on our 'Contact' page.",
    icon: <MapPin className="w-5 h-5 text-green-600" />,
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section
      id="faq"
      dir={isAr ? "rtl" : "ltr"}
      className="py-24  relative overflow-hidden"
    >
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-96 h-96 bg-orange-50 rounded-full blur-3xl opacity-50" />

      <div className="max-w-3xl mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-orange-600 font-bold text-sm tracking-widest uppercase mb-4 block"
          >
            {isAr ? "لديك أسئلة؟" : "Have Questions?"}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight"
          >
            {isAr ? "الأسئلة الشائعة" : "The Pizza FAQ"}
          </motion.h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border-2 rounded-[2rem] transition-all duration-300 ${
                openIndex === index
                  ? "border-orange-500 bg-orange-50/30 shadow-lg shadow-orange-100"
                  : "border-slate-100 bg-white"
              }`}
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full flex justify-between items-center p-6 text-lg font-bold text-slate-800 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`p-2 rounded-xl ${
                      openIndex === index
                        ? "bg-orange-500 text-white"
                        : "bg-slate-50 text-slate-400"
                    }`}
                  >
                    {faq.icon}
                  </div>
                  <span className="text-start leading-tight">
                    {isAr ? faq.question_ar : faq.question_en}
                  </span>
                </div>
                <div
                  className={`transition-transform duration-300 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                >
                  {openIndex === index ? (
                    <Minus className="w-6 h-6 text-orange-600" />
                  ) : (
                    <Plus className="w-6 h-6 text-slate-400" />
                  )}
                </div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-6 pb-6 text-slate-600 text-lg font-medium leading-relaxed"
                  >
                    <div className="pt-2 border-t border-orange-100">
                      {isAr ? faq.answer_ar : faq.answer_en}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
