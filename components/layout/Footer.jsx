"use client";
import { useLanguage } from "@/context/LanguageContext";
import { Separator } from "../ui/Separator";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  Phone,
  MapPin,
  Clock,
  Pizza,
} from "lucide-react";
import Link from "next/link";

export const Footer = () => {
  const { lang } = useLanguage();
  const isAr = lang === "ar";

  return (
    <footer className="bg-slate-100 from-20% border-t border-orange-50">
      <div className="container mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Brand Info */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                <Pizza className="text-white w-6 h-6" />
              </div>
              <span className="font-black text-2xl tracking-tighter text-slate-900">
                PIZZA & GYRO <span className="text-orange-500">PARTY</span>
              </span>
            </Link>
            <p className="text-slate-500 font-medium leading-relaxed">
              {isAr
                ? "بنقدم لك طعم البيتزا والجايرو الأصلي مع إمكانية تخصيص كل تفاصيل طلبك. جودتنا هي سر لمتنا!"
                : "Serving authentic Pizza & Gyro with full customization. Our quality is what brings the party to your table!"}
            </p>
            <div className="flex items-center gap-4">
              {[Facebook, Instagram, Twitter].map((Icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:bg-orange-500 hover:text-white transition-all"
                >
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">
              {isAr ? "روابط سريعة" : "Quick Links"}
            </h3>
            <ul className="space-y-4"></ul>
          </div>

          {/* Opening Hours */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">
              {isAr ? "أوقات العمل" : "Opening Hours"}
            </h3>
            <div className="space-y-4 text-slate-500 font-bold">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-green-600" />
                <span>
                  {isAr ? "يومياً: 11 ص - 12 م" : "Daily: 11 AM - 12 PM"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-orange-500" />
                <span>
                  {isAr ? "الجمعة: 1 م - 2 ص" : "Friday: 1 PM - 2 AM"}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">
              {isAr ? "تواصل معنا" : "Contact Us"}
            </h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-orange-500 shrink-0" />
                <span className="text-slate-500 font-bold leading-tight">
                  {isAr
                    ? "123 شارع البيتزا، نيوجيرسي، أمريكا"
                    : "5500 Murfreesboro Rd., La Vergne TN 37086, USA"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-5 w-5 text-green-600" />
                <a
                  href="tel:+123456789"
                  className="text-slate-900 font-black hover:text-orange-500 transition-colors"
                >
                  +1 (234) 567-890
                </a>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="h-5 w-5 text-orange-500" />
                <a
                  href="mailto:info@pizzagyro.com"
                  className="text-slate-500 font-bold hover:text-orange-500 transition-colors"
                >
                  hello@pizzagyroparty.com
                </a>
              </div>
            </div>
          </div>
        </div>

        <Separator className="my-12 bg-slate-100" />

        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-slate-400 text-sm font-medium">
            {isAr
              ? `© ${new Date().getFullYear()} بيتزا وجايرو بارتي. جميع الحقوق محفوظة.`
              : `© ${new Date().getFullYear()} Pizza & Gyro Party. All rights reserved.`}
          </p>
          <div className="flex items-center gap-8 text-sm font-bold">
            <Link
              href="/privacy"
              className="text-slate-400 hover:text-orange-500 transition-colors"
            >
              {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
            </Link>
            <Link
              href="/terms"
              className="text-slate-400 hover:text-orange-500 transition-colors"
            >
              {isAr ? "شروط الاستخدام" : "Terms of Use"}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
