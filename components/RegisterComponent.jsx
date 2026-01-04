"use client";
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Check,
  User,
  Mail,
  Phone,
  Lock,
  Info,
  PhoneIcon,
} from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/Input";
import { Label } from "./ui/Label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/Card";
import { toast } from "sonner";
import { Separator } from "./ui/Separator";
import { Alert, AlertDescription } from "./ui/Alert";

import { useAuth } from "../context/AuthContext";
import api from "../api/axiosClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/context/LanguageContext";

const cardVariants = {
  hidden: (i) => ({
    opacity: 0,
    x: i % 2 === 0 ? 100 : -90,
  }),
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.3 },
  },
};

const RegisterComponent = () => {
  const router = useRouter();
  const { lang } = useLanguage();
  const { user, login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+1",
    password: "",
    ref: "",
    role: "",
    password_confirmation: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const register = async (formData) => {
    try {
      await api().get("/sanctum/csrf-cookie");
      const response = await api().post("/register", formData);

      toast.success("تم التسجيل بنجاح!");
      return response.data.user;
    } catch (error) {
      return error;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isValidEmail(formData.email)) {
      return toast.error("الرجاء إدخال بريد إلكتروني صحيح");
    }

    if (formData.password !== formData.password_confirmation) {
      return toast.error("كلمتا المرور غير متطابقتين");
    }

    if (formData.password.length < 8) {
      return toast.error("كلمة المرور يجب أن تكون 8 أحرف على الأقل");
    }

    if (formData.phone.length < 7) {
      return toast.error("رقم الهاتف مطلوب");
    }

    setIsSubmitting(true);

    try {
      const form = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
        phone: formData.countryCode + formData.phone,
        ref: formData.ref,
        role: formData.role,
      };
      const response = await register(form);

      const user = response;
      const message = response?.data?.message;

      if (!user) {
        throw new Error(message || "فشل التسجيل");
      }

      await login(user);
      toast.success(`تم التسجيل بنجاح: ${user.name}`);
      router.push("/");
    } catch (error) {
      const backendErrors = error.response?.data?.errors;
      if (backendErrors) {
        const messages = Object.values(backendErrors).flat();
        toast.error(messages[0]);
        setError(messages[0]);
      } else {
        setError(error.message || "حدث خطأ غير متوقع أثناء التسجيل");
        toast.error(error.message || "حدث خطأ ما.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className=" rounded-lg mt-6 shadow-md flex justify-center items-center py-6 pt-14 px-4"
      dir={lang === "ar" ? "rtl" : "ltr"}
      variants={cardVariants}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
    >
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">
            {lang === "ar" ? "إنشاء حساب" : "Create Account"}
          </CardTitle>
          <CardDescription className="text-slate-500 font-medium">
            {lang === "ar"
              ? "انضم لعائلة بايرتي! سجل الآن للحصول على خصومات حصرية وتتبع طلباتك."
              : "Join the Party! Register now for exclusive discounts and to track your orders."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive" className="mb-2">
              <Info className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Separator />

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />

                  {lang === "ar" ? "الاسم الكامل" : "Full Name"}
                </Label>
                <Input
                  name="name"
                  placeholder={
                    lang === "ar" ? "أدخل اسمك الكامل" : "Enter your full name"
                  }
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                </Label>
                <Input
                  name="email"
                  type="email"
                  placeholder={
                    lang === "ar" ? "أدخل بريدك الإلكتروني" : "Enter your email"
                  }
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* Phone */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Label htmlFor="phone">
                    {" "}
                    <PhoneIcon className="h-4 w-4 text-muted-foreground" />
                  </Label>
                  <select
                    className={`
                         text-black placeholder-gray-400 border-gray-700
                      rounded-md border p-2`}
                    name="countryCode"
                    value={formData.countryCode}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="+20">🇪🇬 +20</option>
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+1">🇺🇸 +1</option>
                  </select>

                  <Input
                    className={` flex-1 text-black placeholder-gray-700 border-gray-700 `}
                    name="phone"
                    placeholder="123456789"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    type="tel"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  {lang === "ar" ? "كلمة المرور" : "Password"}
                </Label>
                <div className="relative">
                  <Input
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder={
                      lang === "ar"
                        ? "أنشئ كلمة مرور (8 أحرف على الأقل)"
                        : "Create a password (at least 8 characters)"
                    }
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    className="pr-10"
                  />
                  <span
                    className="absolute text-blue-600 cursor-pointer font-extrabold  right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-6 w-6" />
                    ) : (
                      <Eye className="h-6 w-6" />
                    )}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="password_confirmation"
                  className="flex items-center gap-2"
                >
                  <Check className="h-4 w-4 text-muted-foreground" />
                  {lang === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"}
                </Label>
                <div className="relative">
                  <Input
                    name="password_confirmation"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder={
                      lang === "ar"
                        ? "أعد إدخال كلمة المرور"
                        : "Re-enter password"
                    }
                    value={formData.password_confirmation}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    className="pr-10"
                  />
                  <span
                    className="absolute text-blue-600 cursor-pointer font-extrabold  right-3 top-1/2 -translate-y-1/2"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-6 w-6" />
                    ) : (
                      <Eye className="h-6 w-6" />
                    )}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />

                  {lang === "ar" ? "(اختياري) رمز الإحالة" : "Referral Code"}
                </Label>
                <Input
                  name="ref"
                  placeholder={
                    lang === "ar"
                      ? "أدخل رمز الإحالة"
                      : "Enter your referral code"
                  }
                  value={formData.ref}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex items-center gap-2">
                <input type="checkbox" id="terms" required />
                <label
                  htmlFor="terms"
                  className="text-sm text-muted-foreground"
                >
                  {lang === "ar" ? "أوافق على" : "I agree to"}{" "}
                  <Link href="/terms" className="text-primary hover:underline">
                    {lang === "ar" ? "شروط الخدمة" : "Terms of Service"}
                  </Link>{" "}
                  و{" "}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    {lang === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
                  </Link>
                </label>
              </div>

              <Button
                className="w-full custom-button"
                type="submit"
                disabled={isSubmitting}
              >
                {" "}
                {isSubmitting
                  ? lang === "ar"
                    ? "جاري إنشاء الحساب..."
                    : "Creating account..."
                  : lang === "ar"
                  ? "تسجيل"
                  : "Register"}
              </Button>
            </div>
          </form>

          <div className="text-sm text-center text-muted-foreground">
            {lang === "ar" ? "لديك حساب بالفعل؟" : "Already have an account?"}{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              {lang === "ar" ? "تسجيل الدخول" : "Login"}
            </Link>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RegisterComponent;
