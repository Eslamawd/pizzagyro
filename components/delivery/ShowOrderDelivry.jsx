"use client";

import { useEffect, useState, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { getOrdersDelivery } from "@/lib/orderApi";
import { connectSocket, joinOrder } from "@/services/socket";
import Pagination from "../layout/Pagination";

export default function OrdersShowDelivry() {
  const { lang } = useLanguage();
  const { formatPrice } = useCurrency();
  const isArabic = lang === "ar";

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  /* =========================
     📌 Fetch Orders
  ========================== */
  const fetchOrders = async () => {
    try {
      const response = await getOrdersDelivery(currentPage);
      setOrders(response.data || []);
      setCurrentPage(response.current_page || 1);
      setLastPage(response.last_page || 1);
      setTotal(response.total || 0);
    } catch (err) {
      console.error("Fetch orders error:", err);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchOrders();
  }, [currentPage]);

  /* =========================
     📡 Socket handling
  ========================== */
  const handleOrderUpdate = useCallback(({ order_id, status }) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === order_id ? { ...order, status } : order
      )
    );
  }, []);

  useEffect(() => {
    if (!orders.length) return;

    const socket = connectSocket();

    orders.forEach((order) => {
      joinOrder(order.id);
    });

    socket.on("order_updated", handleOrderUpdate);

    return () => {
      socket.off("order_updated", handleOrderUpdate);
    };
  }, [orders.length, handleOrderUpdate]);

  /* =========================
     🟢 Status Badge
  ========================== */
  const renderStatus = (status) => {
    const map = {
      pending: ["Pending", "قيد الانتظار", "bg-blue-500"],
      in_progress: ["In Progress", "قيد التنفيذ", "bg-yellow-500"],
      ready: ["Ready", "جاهز", "bg-green-500"],
      delivered: ["Delivered", "تم التوصيل", "bg-purple-500"],
      cancelled: ["Cancelled", "تم الإلغاء", "bg-red-500"],
      payid: ["Paid", "تم الدفع", "bg-emerald-500"],
    };

    const [en, ar, color] = map[status] || [
      "Unknown",
      "غير معروف",
      "bg-gray-500",
    ];

    return (
      <span className={`text-xs px-2 py-1 rounded font-semibold ${color}`}>
        {isArabic ? ar : en}
      </span>
    );
  };

  /* =========================
     🧩 Item Options
  ========================== */
  const renderItemOptions = (options) => {
    if (!options?.length) return null;

    const grouped = {};
    options.forEach((opt) => {
      grouped[opt.option_type] ??= [];
      grouped[opt.option_type].push(opt);
    });

    const labels = {
      size: isArabic ? "الحجم" : "Size",
      dough: isArabic ? "العجينة" : "Dough",
      sauce: isArabic ? "الصلصة" : "Sauce",
      filling: isArabic ? "الحشوة" : "Filling",
      extra: isArabic ? "إضافات" : "Extra",
      topping: isArabic ? "الإضافات" : "Toppings",
    };

    return Object.entries(grouped).map(([type, opts]) => (
      <div key={type} className="text-xs mt-2 border-l-2 border-slate-100 pl-2">
        <span className="font-bold text-slate-500 block mb-1">
          {labels[type] || type}:
        </span>
        <div className="flex flex-wrap gap-1">
          {opts.map((o, index) => (
            <div
              key={index}
              className="flex items-center bg-slate-50 px-1 py-0.5 rounded border border-slate-200"
            >
              {/* عرض ملصق الموقع فقط إذا كان موجوداً وغير "whole" */}
              {o.pivot?.position === "right" && (
                <span className="bg-orange-600 text-white text-[8px] px-1 rounded-sm mr-1 font-bold uppercase">
                  R
                </span>
              )}
              {o.pivot?.position === "left" && (
                <span className="bg-blue-600 text-white text-[8px] px-1 rounded-sm mr-1 font-bold uppercase">
                  L
                </span>
              )}
              <span className="text-slate-700">
                {isArabic ? o.name : o.name_en}
              </span>
            </div>
          ))}
        </div>
      </div>
    ));
  };
  /* =========================
     ⛔ No Orders
  ========================== */
  if (!loading && orders.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] text-white/70">
        {isArabic ? "لا توجد طلبات" : "No orders found"}
      </div>
    );
  }

  /* =========================
     🧾 UI
  ========================== */
  return (
    <div className="container mx-auto px-4 py-10 font-cairo">
      <h1 className="text-2xl font-bold text-center mb-8">
        {isArabic ? "طلبات التوصيل" : "Delivery Orders"}
      </h1>
      <div className="space-y-6">
        {orders.map((order) => (
          <div
            key={order.id}
            className=" rounded-xl border bg-white border-white/20"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="font-bold text-lg">
                  {isArabic ? "طلب #" : "Order #"}
                  {order.id}
                </h3>
                <p className="text-xs ">
                  {new Date(order.created_at).toLocaleString()}
                </p>
              </div>
              {renderStatus(order.status)}
            </div>

            {/* Items */}
            <div className="space-y-3">
              {order.order_items.map((orderItem) => {
                const product = orderItem.item;

                return (
                  <div
                    key={orderItem.id}
                    className="flex gap-3 items-center  p-4 rounded-2xl border border-slate-100"
                  >
                    {product?.image && (
                      <img
                        src={product.image}
                        className="w-14 h-14 rounded object-cover"
                        alt={product.name}
                      />
                    )}

                    <div className="flex-1">
                      <p className="font-medium">
                        {isArabic ? product.name : product.name_en} ×{" "}
                        {orderItem.quantity}
                      </p>

                      <p className="text-sm 0">
                        {formatPrice(orderItem.price)} × {orderItem.quantity}
                      </p>

                      <p className="font-bold">
                        {formatPrice(orderItem.subtotal)}
                      </p>

                      {renderItemOptions(orderItem.options)}

                      {orderItem.comment && (
                        <p className="text-xs italic  mt-1">
                          {orderItem.comment}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Footer */}
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/20">
              <span className="font-semibold">
                {isArabic ? "الإجمالي:" : "Total:"}
              </span>
              <span className="text-xl  font-bold">
                {formatPrice(order.total_price)}
              </span>
            </div>
          </div>
        ))}
      </div>{" "}
      <Pagination
        currentPage={currentPage}
        lastPage={lastPage}
        total={total}
        label={lang === "ar" ? "الطلبات" : "Orders"}
        onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        onNext={() => setCurrentPage((prev) => Math.min(prev + 1, lastPage))}
      />
    </div>
  );
}
