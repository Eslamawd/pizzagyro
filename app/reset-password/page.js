"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { resetPassword } from "@/lib/email";

export default function ResetPasswordPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const router = useRouter();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error("كلمتا المرور غير متطابقتين");
      return;
    }

    setLoading(true);
    try {
      const response = await resetPassword({
        token,
        email,
        password,
        password_confirmation: confirmPassword,
      });

      if (response.error) {
        toast.error(response.error);
        setLoading(false);
        return;
      }

      setPassword("");
      setConfirmPassword("");
      toast.success("تمت إعادة تعيين كلمة المرور بنجاح");
      router.push("/login"); // إعادة توجيه لصفحة تسجيل الدخول
    } catch (err) {
      toast.error("فشل في إعادة التعيين، حاول مرة أخرى");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 mb-20 border rounded-md shadow">
      <h2 className="text-2xl font-bold mb-4 text-center">
        إعادة تعيين كلمة المرور
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="كلمة المرور الجديدة"
          className="w-full border px-3 py-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="تأكيد كلمة المرور"
          className="w-full border px-3 py-2 rounded"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 custom-button py-2 rounded w-full"
          disabled={loading}
        >
          {loading ? "جاري إعادة التعيين..." : "إعادة التعيين"}
        </button>
      </form>
    </div>
  );
}
