"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { verificationEmail } from "@/lib/email";
import { toast } from "sonner";

export default function VerifyEmail() {
  const params = useParams(); // { id, hash }
  const router = useRouter();
  const searchParams = useSearchParams();
  const [message, setMessage] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    const verify = async () => {
      try {
        const query = searchParams.toString();
        const data = await verificationEmail(params.id, params.hash, query);

        setMessage(data.message || "تم تأكيد البريد الإلكتروني بنجاح");
        toast.success(data.message || "تم تأكيد البريد الإلكتروني بنجاح");

        router.push("/"); // إعادة التوجيه للرئيسية
      } catch (err) {
        setError(err);
        setMessage("حدث خطأ أثناء تأكيد البريد الإلكتروني");
        toast.error("حدث خطأ أثناء تأكيد البريد الإلكتروني");
      }
    };

    verify();
  }, [params, searchParams, router]);

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-2xl font-bold mb-4">تأكيد البريد الإلكتروني</h1>
      {error ? (
        <p className="text-red-500">{message}</p>
      ) : (
        <p className="text-green-500">{message}</p>
      )}
      <p className="text-gray-500">
        الرجاء الانتظار بينما نقوم بتأكيد بريدك الإلكتروني...
      </p>
      <p>جاري التحقق...</p>
    </div>
  );
}
