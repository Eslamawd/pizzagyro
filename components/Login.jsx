"use client";
import React, { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/Input";
import { Label } from "../components/ui/Label";
import { Alert, AlertDescription } from "../components/ui/Alert";
import { Mail, Lock, Eye, EyeOff, Info } from "lucide-react";
import { Separator } from "../components/ui/Separator";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/Card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "./ui/Dialog";
import { motion } from "framer-motion";
import api from "../api/axiosClient";
import { forgetPassword } from "../lib/email";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLanguage } from "@/context/LanguageContext";

const cardVariants = {
  hidden: (i) => ({
    opacity: 0,
    x: i % 2 === 0 ? 100 : -90,
  }),
  show: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7 },
  },
};

const Login = () => {
  const router = useRouter();
  const { login } = useAuth();
  const { lang } = useLanguage();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const [showResetDialog, setShowResetDialog] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [resetSent, setResetSent] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      await api().get("/sanctum/csrf-cookie");
      const response = await api().post("/login", formData);
      if (response.status !== 200) {
        throw new Error("Login failed");
      }
      const userData = response.data.user;
      await login(userData);
      toast.success("Login successful ✅");
      router.push("/");
    } catch (err) {
      if (err.response?.status === 422) {
        toast.error("Invalid email or password");
      } else {
        toast.error("Invalid email or password");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async () => {
    if (!resetEmail) {
      toast.error("Please enter your email address");
      return;
    }
    setResetSubmitting(true);
    try {
      const response = await forgetPassword({ email: resetEmail });
      toast.success(`${response.message}`);
      setResetSent(true);
      setResetEmail("");
      setShowResetDialog(false);
    } catch (err) {
      toast.error(
        err.response?.data?.message || "Failed to send password reset link"
      );
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <>
      <motion.div
        className=" rounded-lg shadow-md flex justify-center items-center py-14 mt-6 px-4"
        dir={lang === "ar" ? "rtl" : "ltr"}
        variants={cardVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.5 }}
      >
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">
              {lang === "ar" ? "تسجيل الدخول" : "Login"}
            </CardTitle>
            <CardDescription>
              {lang === "ar"
                ? "أدخل بياناتك للوصول إلى حسابك"
                : "Enter your credentials to access your account"}
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
                  <Label htmlFor="email" className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                  </Label>
                  <Input
                    name="email"
                    type="email"
                    placeholder={
                      lang === "ar"
                        ? "أدخل بريدك الإلكتروني"
                        : "Enter your email"
                    }
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label
                      htmlFor="password"
                      className="flex items-center gap-2"
                    >
                      <Lock className="h-4 w-4 text-muted-foreground" />
                      {lang === "ar" ? "كلمة المرور" : "Password"}
                    </Label>
                    <span
                      className="cursor-pointer text-blue-200 text-sm"
                      onClick={() => setShowResetDialog(true)}
                    >
                      {lang === "ar"
                        ? "هل نسيت كلمة المرور؟"
                        : "Forgot password?"}
                    </span>
                  </div>
                  <div className="relative">
                    <Input
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder={
                        lang === "ar"
                          ? "أدخل كلمة المرور"
                          : "Enter your password"
                      }
                      value={formData.password}
                      onChange={handleInputChange}
                      required
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

                <Button
                  className="w-full"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? lang === "ar"
                      ? "جاري تسجيل الدخول..."
                      : "Logging in..."
                    : lang === "ar"
                    ? "تسجيل الدخول"
                    : "Login"}
                </Button>
              </div>
            </form>

            <div className="text-sm text-center text-muted-foreground">
              {lang === "ar" ? "ليس لديك حساب؟" : "Don't have an account?"}{" "}
              <Link
                href="/register"
                className="text-primary hover:underline font-medium"
              >
                {lang === "ar" ? "إنشاء حساب" : "Create an account"}
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <DialogContent className="sm:max-w-md p-8 bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-950/95 border border-white/10 shadow-2xl backdrop-blur-md text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">
              {lang === "ar" ? "إعادة تعيين كلمة المرور" : "Reset Password"}
            </DialogTitle>
            <DialogDescription className="text-gray-300 leading-relaxed">
              {lang === "ar"
                ? "أدخل بريدك الإلكتروني وسنرسل لك رابطًا لإعادة تعيين كلمة المرور."
                : "Enter your email and we’ll send you a link to reset your password."}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {resetSent ? (
              <Alert className="border-green-500/50 bg-green-500/10 text-green-300">
                <AlertDescription>
                  {lang === "ar"
                    ? "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني."
                    : "A link to reset your password has been sent to your email."}
                </AlertDescription>
              </Alert>
            ) : (
              <div className="space-y-2">
                <Label
                  htmlFor="resetEmail"
                  className="flex items-center gap-2 text-gray-200"
                >
                  <Mail className="h-4 w-4 text-cyan-400" />
                  {lang === "ar" ? "البريد الإلكتروني" : "Email"}
                </Label>
                <Input
                  id="resetEmail"
                  type="email"
                  className="bg-gray-800/80 border border-gray-700 text-white placeholder-gray-400 focus:border-cyan-400 focus:ring-0"
                  placeholder={
                    lang === "ar" ? "أدخل بريدك الإلكتروني" : "Enter your email"
                  }
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                />
              </div>
            )}
          </div>

          <Button
            onClick={() => setShowResetDialog(false)}
            disabled={resetSubmitting}
            className="border border-gray-700 text-gray-300 hover:bg-gray-800/70 hover:text-white transition"
          >
            {lang === "ar" ? "إلغاء" : "Cancel"}
          </Button>
          <Button
            onClick={handleResetPassword}
            disabled={resetSubmitting || resetSent}
            className="bg-gradient-to-r from-cyan-500 to-emerald-500 text-white font-semibold shadow-md hover:shadow-lg hover:from-emerald-500 hover:to-cyan-500 transition-all"
          >
            {resetSubmitting
              ? lang === "ar"
                ? "جاري الإرسال..."
                : "Sending..."
              : lang === "ar"
              ? "إرسال الرابط"
              : "Send Link"}
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Login;
