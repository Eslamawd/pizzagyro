"use client";

import CashierManagment from "@/components/cashier/CashierManagment";
import api from "@/api/axiosClient";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function CashierHomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [context, setContext] = useState(null);
  const [contextLoading, setContextLoading] = useState(true);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      router.replace("/login");
      return;
    }

    if (user.role !== "cashier") {
      router.replace("/");
      return;
    }

    const fetchContext = async () => {
      try {
        const response = await api().get("/api/cashier/context");
        setContext(response.data);
      } catch (error) {
        console.error("Failed to load cashier context", error);
        router.replace("/");
      } finally {
        setContextLoading(false);
      }
    };

    fetchContext();
  }, [loading, user, router]);

  if (loading || contextLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        جاري تحميل لوحة الكاشير...
      </div>
    );
  }

  if (!context) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white bg-gray-900">
        لا يمكن تحميل بيانات الكاشير.
      </div>
    );
  }

  return (
    <CashierManagment
      cashier={context.cashier_id}
      restaurant_id={context.restaurant_id}
      user_id={context.user_id}
      token={context.token}
    />
  );
}
