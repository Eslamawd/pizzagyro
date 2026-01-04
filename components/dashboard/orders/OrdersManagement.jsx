"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import Pagination from "../../layout/Pagination";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  getRestaurantOrders,
  getRestaurantOrdersAdmin,
} from "@/lib/restaurantApi";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const statesOrder = [
  { en: "All", ar: "الكل", value: "" },
  { en: "Paid", ar: "مدفوع", value: "payid" },
  { en: "Pending", ar: "معلق", value: "pending" },
  { en: "In Progress", ar: "قيد التنفيذ", value: "in_progress" },
  { en: "Ready", ar: "جاهز", value: "ready" },
  { en: "Delivered", ar: "تم التوصيل", value: "delivered" },
  { en: "Cancelled", ar: "ملغى", value: "cancelled" },
];

// 🎨 ألوان الحالات
const getStatusColor = (status) => {
  switch (status) {
    case "pending":
      return "bg-yellow-600";
    case "in_progress":
      return "bg-blue-600";
    case "ready":
      return "bg-indigo-600";
    case "delivered":
      return "bg-green-600";
    case "cancelled":
      return "bg-red-700";
    case "payid":
      return "bg-emerald-500";
    default:
      return "bg-gray-500";
  }
};

function OrdersManagement({ restaurantId }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [revenue, setRevenue] = useState(0);
  const [count, setCount] = useState(0);
  const [state, setState] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const { user } = useAuth();

  const { lang } = useLanguage();
  const { formatPrice } = useCurrency();

  const fetchOrders = async () => {
    const status = { state: state };
    setLoading(true);
    try {
      const res =
        user.role === "admin"
          ? await getRestaurantOrdersAdmin(restaurantId, status, currentPage)
          : await getRestaurantOrders(restaurantId, status, currentPage);
      setOrders(res.orders.data);
      setRevenue(res.revenue);
      setCount(res.count);
      setCurrentPage(res.orders.current_page);
      setLastPage(res.orders.last_page);
      setTotal(res.orders.total);
    } catch (error) {
      toast.error(
        lang === "ar" ? "فشل تحميل الطلبات" : "Failed to load orders"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [restaurantId, state, currentPage]);

  const translateStatus = (status) => {
    switch (status) {
      case "pending":
        return "قيد الانتظار";
      case "in_progress":
        return "قيد التنفيذ";
      case "ready":
        return "جاهز";
      case "delivered":
        return "تم التوصيل";
      case "cancelled":
        return "ملغي";
      case "payid":
        return "مدفوع";
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <motion.div
      dir={lang === "ar" ? "rtl" : "ltr"}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="text-gray-200"
    >
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
        <h2 className="text-2xl font-bold">
          {lang === "ar" ? "إدارة الطلبات" : "Orders Management"}
        </h2>
        <select
          value={state}
          onChange={(e) => setState(e.target.value)}
          className="bg-gray-800 text-white rounded-md px-3 py-2"
        >
          {statesOrder.map((s) => (
            <option key={s.value} value={s.value}>
              {s[lang]}
            </option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        <div className="mt-4 text-center text-lg font-semibold">
          {lang === "ar" ? "إجمالي الأرباح:" : "Total Revenue:"}{" "}
          {formatPrice(Number(revenue))}
        </div>
        <div className="mt-4 text-center text-lg font-semibold">
          {lang === "ar" ? "إجمالي الطلبات:" : "Total Orders:"} {count}
        </div>

        {orders.length === 0 ? (
          <p className="text-center mt-10 font-cairo text-lg">
            {lang === "ar" ? "لا توجد طلبات بعد" : "No orders yet"}
          </p>
        ) : (
          <ul className="space-y-4 mt-6">
            {orders.map((order) => (
              <li
                key={order.id}
                className="border border-gray-700 bg-gray-900 rounded-lg p-4"
              >
                {/* رأس الطلب */}
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold text-lg">
                    #{order.id} - {lang === "ar" ? "طاولة:" : "Table:"}{" "}
                    {order.table?.name || "-"}
                  </span>
                  <span
                    className={`text-xs px-3 py-1 rounded-full font-semibold ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {lang === "ar"
                      ? translateStatus(order.status)
                      : order.status.replace("_", " ")}
                  </span>
                </div>

                {/* السعر */}
                <p className="text-gray-300 text-sm">
                  {lang === "ar" ? "السعر الإجمالي:" : "Total:"}{" "}
                  {formatPrice(Number(order.total_price))}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {lang === "ar" ? "تاريخ الإنشاء:" : "Created:"}{" "}
                  {new Date(order.created_at).toLocaleString()}
                </p>

                {/* تفاصيل المنتجات */}
                {order.order_items.length > 0 && (
                  <div className="mt-4 border-t border-gray-700 pt-3 space-y-2">
                    {order.order_items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between bg-gray-800 p-2 rounded-lg"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.item.image}
                            alt={item.item.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                          <div>
                            <p className="font-semibold">
                              {lang === "ar"
                                ? item.item.name
                                : item.item.name_en}
                            </p>
                            <p className="text-sm text-gray-400">
                              × {item.quantity}
                            </p>

                            <p className="text-sm">تعليق: {item.comment}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-400">
                            {formatPrice(Number(item.price))}
                          </p>
                          {item.item.old_price && (
                            <p className="text-xs line-through text-gray-500">
                              {formatPrice(Number(item.item.old_price))}
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
        <Pagination
          currentPage={currentPage}
          lastPage={lastPage}
          total={total}
          label={lang === "ar" ? "الطلبات" : "Orders"}
          onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          onNext={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
        />
      </div>
    </motion.div>
  );
}

export default OrdersManagement;
