"use client";
import { useLanguage } from "@/context/LanguageContext";
import { motion } from "framer-motion";
import { Pizza, PlusCircle, Flame, Truck, Layers, Heart } from "lucide-react";

const features = [
  {
    icon: <PlusCircle className="h-10 w-10" />,
    title_ar: "صمم بيتزتك على ذوقك",
    title_en: "Customize Your Cravings",
    description_ar:
      "أضف طبقات الجبن، شيل الزيتون، أو زود البيبروني. المطبخ هينفذ طلبك بالحرف!",
    description_en:
      "Add extra cheese, remove olives, or double the pepperoni. Our kitchen makes it exactly how you want it.",
    accent: "text-orange-500 bg-orange-50",
  },
  {
    icon: <Layers className="h-10 w-10" />,
    title_ar: "تحكم كامل في المكونات",
    title_en: "Total Topping Control",
    description_ar:
      "من نوع العجينة (سميكة أو رفيعة) لحد الصوصات الجانبية، كل شيء تحت اختيارك.",
    description_en:
      "From crust style (Thin or Pan) to side sauces, every single detail is your choice.",
    accent: "text-green-600 bg-green-50",
  },
  {
    icon: <Flame className="h-10 w-10" />,
    title_ar: "فرش وطازة دايماً",
    title_en: "Freshly Baked for You",
    description_ar:
      "البيتزا والجايرو بيتحضروا لحظة طلبك عشان يوصلوا لك سخنين وبأفضل جودة.",
    description_en:
      "Your Pizza & Gyro are prepared the moment you order to ensure maximum freshness and heat.",
    accent: "text-orange-500 bg-orange-50",
  },
  {
    icon: <Pizza className="h-10 w-10" />,
    title_ar: "جايرو البحر المتوسط",
    title_en: "Authentic Gyro Party",
    description_ar:
      "مش بس بيتزا! استمتع بأفضل سندوتشات الجايرو المتبلة بخلطتنا السرية.",
    description_en:
      "Not just pizza! Enjoy the best Mediterranean gyro seasoned with our secret family blend.",
    accent: "text-green-600 bg-green-50",
  },
  {
    icon: <Truck className="h-10 w-10" />,
    title_ar: "توصيل سريع لمنزلك",
    title_en: "Lightning Fast Delivery",
    description_ar:
      "فريقنا جاهز يوصل لك الأكل في أسرع وقت عشان تستمتع بطعمه وهو لسه طالع من الفرن.",
    description_en:
      "Our delivery heroes ensure your meal arrives hot and fresh right to your doorstep.",
    accent: "text-orange-500 bg-orange-50",
  },
  {
    icon: <Heart className="h-10 w-10" />,
    title_ar: "حب في كل قطمة",
    title_en: "Made With Love",
    description_ar:
      "بنستخدم أجود المكونات الطازجة يومياً عشان نضمن لك تجربة أكل ممتعة.",
    description_en:
      "We use only the finest fresh ingredients every day to guarantee an unforgettable meal experience.",
    accent: "text-green-600 bg-green-50",
  },
];

const Features = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <section id="features" className="relative py-24 ">
      <div className="container mx-auto px-6">
        {/* Title Section */}
        <div className="max-w-3xl mx-auto text-center mb-20">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-block px-4 py-1.5 mb-6 rounded-full bg-orange-100 text-orange-600 text-sm font-bold tracking-widest uppercase"
          >
            {isAr ? "لماذا تطلب منا؟" : "Why Party With Us?"}
          </motion.div>

          <motion.h2
            className="text-5xl md:text-7xl font-black text-slate-900 mb-6 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {isAr ? "بيتزا " : "More Than Just "}
            <span className="text-orange-500">
              {isAr ? "على مقاسك" : "Pizza"}
            </span>
          </motion.h2>

          <motion.p
            className="text-xl text-slate-500 font-medium leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            {isAr
              ? "في Pizza & Gyro Party، إنت الشيف! صمم وجبتك بمكوناتك المفضلة واستمتع بطعم لا يقاوم."
              : "At Pizza & Gyro Party, you are the chef! Customize your meal with your favorite toppings and enjoy an irresistible taste."}
          </motion.p>
        </div>

        {/* Features Cards Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              dir={isAr ? "rtl" : "ltr"}
              className="group relative p-10 rounded-[3rem]  border border-orange-100/50 shadow-sm hover:shadow-2xl hover:shadow-orange-200/40 transition-all duration-500 hover:-translate-y-3 overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Decorative Pizza Slice in background on hover */}
              <div className="absolute -right-8 -bottom-8 w-32 h-32 text-orange-50/50 group-hover:text-orange-100/40 transition-colors duration-500 rotate-12">
                <Pizza className="w-full h-full" />
              </div>

              <div
                className={`w-20 h-20 rounded-[1.5rem] ${feature.accent} flex items-center justify-center mb-8 group-hover:rotate-[10deg] transition-transform duration-500`}
              >
                {feature.icon}
              </div>

              <h3 className="text-2xl font-black text-slate-900 mb-4 group-hover:text-orange-500 transition-colors">
                {isAr ? feature.title_ar : feature.title_en}
              </h3>

              <p className="text-slate-500 font-bold text-lg leading-relaxed relative z-10">
                {isAr ? feature.description_ar : feature.description_en}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
