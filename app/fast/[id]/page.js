"use client";
import DelivryManagment from "@/components/delivery/DelivryManagment";
import { useParams, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";

// مفاتيح التخزين
const LS_KEYS = {
  restaurant: "pwa_restaurant_id",
  user: "pwa_user_id",
  token: "pwa_auth_token",
};

function Page() {
  const params = useParams();
  const searchParams = useSearchParams();

  // القيم التي تأتي من الـ URL (عند فتح الرابط لأول مرة)
  const url_restaurant_id = searchParams.get("restaurant");
  const url_user_id = searchParams.get("user");
  const url_token = searchParams.get("token");

  // 💡 حالة مؤقتة لحمل القيم النهائية التي ستمرر للمكون KitchenManagment
  const [authData, setAuthData] = useState({
    restaurant_id: url_restaurant_id,
    user_id: url_user_id,
    token: url_token,
  });

  useEffect(() => {
    // 1. إذا وجدنا التوكنات في الـ URL، نقوم بحفظها
    if (url_restaurant_id && url_user_id && url_token) {
      console.log("✅ Tokens found in URL. Storing in localStorage.");

      localStorage.setItem(LS_KEYS.restaurant, url_restaurant_id);
      localStorage.setItem(LS_KEYS.user, url_user_id);
      localStorage.setItem(LS_KEYS.token, url_token);

      // نضمن استخدام القيم الجديدة مباشرة
      setAuthData({
        restaurant_id: url_restaurant_id,
        user_id: url_user_id,
        token: url_token,
      });
    } else {
      // 2. إذا لم نجد التوكنات في الـ URL، نقوم بتحميلها من الذاكرة المحلية
      const stored_restaurant_id = localStorage.getItem(LS_KEYS.restaurant);
      const stored_user_id = localStorage.getItem(LS_KEYS.user);
      const stored_token = localStorage.getItem(LS_KEYS.token);

      if (stored_token) {
        console.log("💾 Tokens loaded from localStorage.");
        setAuthData({
          restaurant_id: stored_restaurant_id,
          user_id: stored_user_id,
          token: stored_token,
        });
      } else {
        console.warn(
          "⚠️ No tokens found in URL or localStorage. Redirecting/Error handling needed.",
        );
        // هنا قد ترغب في إعادة التوجيه إلى صفحة تسجيل الدخول أو إظهار رسالة خطأ
      }
    }
  }, [url_restaurant_id, url_user_id, url_token]); // يُعاد التشغيل إذا تغيرت التوكنات في الـ URL

  // 💡 عرض محتوى KitchenManagment فقط بعد تحديد التوكنات
  if (!authData.token) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white"></div>
    );
  }

  return (
    <DelivryManagment
      kitchen={params.id}
      restaurant_id={authData.restaurant_id}
      user_id={authData.user_id}
      token={authData.token}
    />
  );
}

export default Page;
