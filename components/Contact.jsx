"use client";
import { motion } from "framer-motion";
import { useLanguage } from "@/context/LanguageContext";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import { useState } from "react";
import { Textarea } from "./ui/textarea";
import { sendContect } from "@/lib/email";
import { Loader2, UtensilsCrossed } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export const Contact = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";
  const router = useRouter();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    message: "",
    countryCode: "+1", // تغيير الكود الافتراضي لأمريكا بما أن المطعم هناك
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast.error(
        isAr
          ? "الرجاء ملء جميع الحقول المطلوبة"
          : "Please fill all required fields"
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const form = {
        name: formData.name,
        email: formData.email,
        phone: formData.countryCode + formData.phone,
        message: formData.message,
      };

      const response = await sendContect(form);

      if (!response.message) {
        throw new Error(
          isAr ? "عذراً، فشل إرسال الرسالة" : "Sorry, failed to send message"
        );
      }

      toast.success(
        isAr
          ? "تم إرسال رسالتك بنجاح! سنرد عليك قريباً."
          : "Message sent successfully! We'll reply soon."
      );

      setFormData({
        name: "",
        email: "",
        phone: "",
        message: "",
        countryCode: "+1",
      });

      router.push("/");
    } catch (error) {
      toast.error(
        error.message ||
          (isAr ? "حدث خطأ غير متوقع" : "An unexpected error occurred")
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const text = {
    ar: {
      title: "تواصل مع عائلة الحفلة",
      subtitle:
        "هل لديك سؤال عن المنيو أو ترغب في حجز حفلة خاصة؟ نحن هنا لخدمتك.",
      name: "الاسم الكريم",
      email: "البريد الإلكتروني",
      message: "كيف يمكننا مساعدتك؟",
      send: "إرسال الرسالة",
      phone: "رقم الهاتف",
      placeholders: {
        name: "أدخل اسمك هنا",
        email: "example@mail.com",
        message: "اكتب رسالتك أو تفاصيل حجزك هنا...",
      },
    },
    en: {
      title: "Connect with the Party",
      subtitle:
        "Have a question about our menu or want to book a private party? We’re here for you.",
      name: "Your Name",
      email: "Email Address",
      message: "How can we help you?",
      send: "Send Message",
      phone: "Phone Number",
      placeholders: {
        name: "Enter your name",
        email: "example@mail.com",
        message: "Write your message or party details here...",
      },
    },
  };

  const t = text[lang];

  return (
    <section
      className="py-24 relative overflow-hidden bg-[#FFFDFB]"
      dir={isAr ? "rtl" : "ltr"}
    >
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-64 bg-gradient-to-b from-orange-500/10 to-transparent" />

      <div className="relative max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-orange-100 text-orange-500 mb-6">
            <UtensilsCrossed size={32} />
          </div>
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
            {t.title}
          </h2>
          <p className="text-xl text-slate-500 max-w-2xl mx-auto font-medium">
            {t.subtitle}
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 items-start">
          {/* Contact Info (Side) */}
          <motion.div
            initial={{ opacity: 0, x: isAr ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            className="lg:col-span-1 space-y-8"
          >
            <div className="bg-white p-8 rounded-[2rem] shadow-xl shadow-orange-100/50 border border-orange-50">
              <h4 className="font-black text-xl mb-4 text-slate-900">
                {isAr ? "فروعنا" : "Our Locations"}
              </h4>
              <p className="text-slate-500 leading-relaxed font-medium">
                {isAr
                  ? "نيويورك، الولايات المتحدة الأمريكية"
                  : "New York, United States"}
              </p>
            </div>
          </motion.div>

          {/* Contact Form */}
          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 md:p-12 shadow-2xl shadow-orange-100/50 border border-orange-50 grid grid-cols-1 md:grid-cols-2 gap-8"
          >
            <div className="flex flex-col gap-3">
              <Label className="font-black text-slate-700 px-1">{t.name}</Label>
              <Input
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder={t.placeholders.name}
                required
                className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>

            <div className="flex flex-col gap-3">
              <Label className="font-black text-slate-700 px-1">
                {t.email}
              </Label>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder={t.placeholders.email}
                required
                className="h-14 rounded-2xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-orange-500 transition-all"
              />
            </div>

            <div className="flex flex-col gap-3 md:col-span-2">
              <Label className="font-black text-slate-700 px-1">
                {t.phone}
              </Label>
              <div className="flex gap-3">
                <select
                  name="countryCode"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                  className="bg-slate-50 rounded-2xl border border-slate-100 px-4 font-bold text-slate-700 focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="+1">🇺🇸 +1</option>
                  <option value="+966">🇸🇦 +966</option>
                  <option value="+20">🇪🇬 +20</option>
                </select>
                <Input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="555-000-000"
                  className="flex-1 h-14 rounded-2xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-orange-500 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 md:col-span-2">
              <Label className="font-black text-slate-700 px-1">
                {t.message}
              </Label>
              <Textarea
                name="message"
                rows={5}
                value={formData.message}
                onChange={handleInputChange}
                placeholder={t.placeholders.message}
                className="rounded-2xl bg-slate-50 border-slate-100 focus:ring-2 focus:ring-orange-500 transition-all p-4"
              />
            </div>

            <div className="md:col-span-2 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white font-black py-5 rounded-2xl shadow-xl shadow-orange-200 transition-all flex items-center justify-center gap-3 text-lg active:scale-95"
              >
                {isSubmitting ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  t.send
                )}
              </button>
            </div>
          </motion.form>
        </div>
      </div>
    </section>
  );
};
