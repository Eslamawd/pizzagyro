"use client";
import { useOrder } from "@/context/OrderContext";
import { Button } from "@/components/ui/button";
import { useEffect, useCallback } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { connectSocket, joinOrder, onOrderUpdated } from "@/services/socket";
import { useCurrency } from "@/context/CurrencyContext";
import { getOrderByUser } from "@/lib/orderApi";

export default function OrdersShow({ restaurant_id, user_id, token }) {
  const {
    orders,
    currentOrder,
    totalPrice,
    removeFromOrder,
    submitOrder,
    clearOrderLocal,
    setStatus,
  } = useOrder();

  const { lang } = useLanguage();
  const { formatPrice } = useCurrency();
  const isArabic = lang === "ar";

  // ✅ دالة لتحديث حالة الطلبات
  const refreshOrders = useCallback(async () => {
    try {
      if (orders.length > 0) {
        for (const ord of orders) {
          const order = await getOrderByUser(
            ord.id,
            restaurant_id,
            user_id,
            token
          );
          setStatus(order.id, order.status);
          if (order.status === "payid" || order.status === "paid") {
            clearOrderLocal(order.id);
          }
        }
      }
    } catch (error) {
      console.error("Error refreshing orders:", error);
    }
  }, [orders, restaurant_id, user_id, token, setStatus, clearOrderLocal]);

  // ✅ تحديث الطلبات كل دقيقة
  useEffect(() => {
    refreshOrders();
  }, []);

  // ✅ إدارة Socket
  useEffect(() => {
    const socket = connectSocket();

    const joinAllOrders = () => {
      orders.forEach((order) => {
        if (order.id) {
          joinOrder(order.id);
        }
      });
    };

    const handleOrderUpdate = ({ order_id, status }) => {
      setStatus(order_id, status);
      if (status === "payid" || status === "paid") {
        clearOrderLocal(order_id);
      }
    };

    socket.on("order_updated", handleOrderUpdate);
    joinAllOrders();

    return () => {
      socket.off("order_updated", handleOrderUpdate);
    };
  }, [orders, setStatus, clearOrderLocal]);

  // ✅ دالة لعرض حالة الطلب
  const renderStatus = (status) => {
    const statusConfig = {
      pending: {
        text: isArabic ? "قيد الانتظار" : "Pending",
        color: "bg-blue-500",
      },
      in_progress: {
        text: isArabic ? "قيد التنفيذ" : "In Progress",
        color: "bg-yellow-500",
      },
      ready: { text: isArabic ? "جاهز" : "Ready", color: "bg-green-500" },
      delivered: {
        text: isArabic ? "تم التوصيل" : "Delivered",
        color: "bg-purple-500",
      },
      cancelled: {
        text: isArabic ? "تم الإلغاء" : "Cancelled",
        color: "bg-red-500",
      },
      paid: { text: isArabic ? "تم الدفع" : "Paid", color: "bg-emerald-500" },
      payid: { text: isArabic ? "تم الدفع" : "Paid", color: "bg-emerald-500" },
    };

    const config = statusConfig[status] || {
      text: isArabic ? "غير معروف" : "Unknown",
      color: "bg-gray-500",
    };

    return (
      <span
        className={`text-xs font-semibold px-2 py-1 rounded ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  // ✅ دالة لعرض خيارات العنصر
  const renderItemOptions = (options) => {
    if (!options || !Array.isArray(options) || options.length === 0) {
      return null;
    }

    // تجميع الخيارات حسب النوع
    const groupedOptions = {};
    options.forEach((option) => {
      if (!groupedOptions[option.option_type]) {
        groupedOptions[option.option_type] = [];
      }
      groupedOptions[option.option_type].push(option);
    });

    return Object.entries(groupedOptions).map(([type, opts], index) => {
      const typeNames = {
        size: isArabic ? "الحجم" : "Size",
        dough: isArabic ? "العجينة" : "Dough",
        sauce: isArabic ? "الصلصة" : "Sauce",
        filling: isArabic ? "الحشوة" : "Filling",
        extra: isArabic ? "إضافات" : "Extra",
        topping: isArabic ? "الطبقة العلوية" : "Topping",
      };

      const totalOptionPrice = opts.reduce(
        (sum, opt) => sum + parseFloat(opt.price || 0),
        0
      );

      return (
        <div key={index} className="text-xs text-white/80 mt-1">
          <span className="font-medium">{typeNames[type] || type}:</span>{" "}
          {opts.map((opt, idx) => (
            <span key={opt.id}>
              {isArabic ? opt.name : opt.name_en}
              {idx < opts.length - 1 ? ", " : ""}
            </span>
          ))}
          {totalOptionPrice > 0 && (
            <span className="text-orange-300 ml-1">
              (+{formatPrice(totalOptionPrice)})
            </span>
          )}
        </div>
      );
    });
  };

  // ✅ إرسال الطلب الحالي
  const handleSend = async () => {
    try {
      const res = await submitOrder(restaurant_id, user_id, token);
      if (res?.id) {
        joinOrder(res.id);
      }
    } catch (error) {
      console.error("Error submitting order:", error);
    }
  };

  // ✅ حالة عدم وجود طلبات
  if (
    (!currentOrder.items || currentOrder.items.length === 0) &&
    orders.length === 0
  ) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <p className="text-center text-xl font-cairo text-white/70 mb-4">
          {isArabic ? "لا توجد طلبات بعد" : "No orders yet"}
        </p>
        <p className="text-center text-white/50">
          {isArabic ? "ابدأ بإنشاء طلب جديد" : "Start by creating a new order"}
        </p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10 font-cairo px-4 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold mb-8 text-center text-white">
        {isArabic ? "كل الطلبات" : "All Orders"}
      </h1>

      {/* ✅ الطلب الحالي قبل الإرسال */}
      {currentOrder.items?.length > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-10 border border-white/20 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-yellow-300">
              {isArabic ? "طلب جاري الإعداد" : "Current Order"}
            </h2>
            <span className="text-sm text-white/70">
              {isArabic ? "غير مرسل بعد" : "Not submitted yet"}
            </span>
          </div>

          <div className="space-y-4 mb-6">
            {currentOrder.items.map((item) => (
              <div
                key={`${item.id}-${JSON.stringify(item.options)}`}
                className="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 bg-white/5 rounded-lg border border-white/10"
              >
                {item.image && (
                  <img
                    className="w-20 h-20 rounded-lg object-cover"
                    src={item.image}
                    alt={item.name}
                  />
                )}

                <div className="flex-1">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                    <div>
                      <h3 className="text-white font-medium">
                        {isArabic ? item.name : item.name_en} × {item.quantity}
                      </h3>
                      <p className="text-gray-200 text-sm">
                        {formatPrice(item.price)} × {item.quantity}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-orange-300 font-semibold">
                        {formatPrice(
                          (parseFloat(item.price || 0) +
                            (item.options?.reduce(
                              (sum, opt) => sum + parseFloat(opt.price || 0),
                              0
                            ) || 0)) *
                            item.quantity
                        )}
                      </p>
                    </div>
                  </div>

                  {/* عرض الخيارات */}
                  <div className="mt-2">{renderItemOptions(item.options)}</div>

                  {/* التعليقات */}
                  {item.comment && (
                    <div className="mt-2 p-2 bg-white/5 rounded">
                      <p className="text-sm text-white/70 italic">
                        <span className="font-medium">
                          {isArabic ? "ملاحظة:" : "Note:"}
                        </span>{" "}
                        {item.comment}
                      </p>
                    </div>
                  )}
                </div>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => removeFromOrder(item.id)}
                  className="mt-2 md:mt-0"
                >
                  {isArabic ? "حذف" : "Remove"}
                </Button>
              </div>
            ))}
          </div>

          <div className="pt-6 border-t border-white/20">
            <div className="flex justify-between items-center mb-6">
              <p className="text-lg font-semibold text-white">
                {isArabic ? "الإجمالي:" : "Total:"}
              </p>
              <p className="text-2xl font-bold text-yellow-300">
                {formatPrice(totalPrice)}
              </p>
            </div>

            <Button
              onClick={handleSend}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-3 rounded-xl text-lg font-semibold shadow-lg transition-all"
              disabled={!currentOrder.restaurant_id || !currentOrder.table_id}
            >
              {isArabic ? "إرسال الطلب" : "Submit Order"}
            </Button>

            {(!currentOrder.restaurant_id || !currentOrder.table_id) && (
              <p className="text-red-300 text-sm text-center mt-2">
                {isArabic
                  ? "الرجاء تحديد المطعم والطاولة أولاً"
                  : "Please select restaurant and table first"}
              </p>
            )}
          </div>
        </div>
      )}

      {/* ✅ الطلبات المرسلة */}
      {orders.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-6 text-white">
            {isArabic ? "الطلبات السابقة" : "Order History"}
          </h2>

          <div className="space-y-6">
            {orders?.map((order) => (
              <div
                key={order.id}
                className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 shadow-lg"
              >
                {/* رأس الطلب */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-2">
                      {isArabic ? "طلب #" : "Order #"}
                      {order.id}
                    </h3>
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <p className="text-sm text-white/70">
                        {order.created_at && (
                          <>
                            {new Date(order.created_at).toLocaleDateString()} -{" "}
                            {new Date(order.created_at).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </>
                        )}
                      </p>
                      {order.table && (
                        <p className="text-sm text-white/70">
                          {isArabic ? "طاولة:" : "Table:"}{" "}
                          {order.table.name || order.table_id}
                        </p>
                      )}
                    </div>
                  </div>
                  {renderStatus(order.status)}
                </div>

                {/* عناصر الطلب */}
                <div className="space-y-4 mb-6">
                  {order.items?.map((item, index) => (
                    <div
                      key={`${item.id}-${index}`}
                      className="flex flex-col md:flex-row gap-4 items-start md:items-center p-4 bg-white/5 rounded-lg"
                    >
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover"
                        />
                      )}

                      <div className="flex-1">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                          <div>
                            <h4 className="font-medium text-white">
                              {isArabic ? item.name : item.name_en} ×{" "}
                              {item.quantity}
                            </h4>
                            <p className="text-gray-200 text-xs">
                              {formatPrice(item.price)} × {item.quantity}
                            </p>
                          </div>

                          <p className="text-orange-300 font-bold">
                            {formatPrice(
                              (parseFloat(item.price || 0) +
                                (item.options?.reduce(
                                  (sum, opt) =>
                                    sum + parseFloat(opt.price || 0),
                                  0
                                ) || 0)) *
                                item.quantity
                            )}
                          </p>
                        </div>

                        {/* عرض الخيارات */}
                        {item.options && item.options.length > 0 && (
                          <div className="mt-2">
                            {renderItemOptions(item.options)}
                          </div>
                        )}

                        {/* التعليقات */}
                        {item.comment && (
                          <div className="mt-2">
                            <p className="text-xs text-white/70 italic">
                              <span className="font-medium">
                                {isArabic ? "ملاحظة:" : "Note:"}
                              </span>{" "}
                              {item.comment}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* تفاصيل إضافية للطلب */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4 p-3 bg-white/5 rounded-lg">
                  {order.payment_method && (
                    <div>
                      <p className="text-sm text-white/70">
                        {isArabic ? "طريقة الدفع:" : "Payment Method:"}
                      </p>
                      <p className="text-white font-medium">
                        {order.payment_method === "cash"
                          ? isArabic
                            ? "نقداً"
                            : "Cash"
                          : isArabic
                          ? "بطاقة ائتمان"
                          : "Credit Card"}
                      </p>
                    </div>
                  )}

                  {order.restaurant?.name && (
                    <div>
                      <p className="text-sm text-white/70">
                        {isArabic ? "المطعم:" : "Restaurant:"}
                      </p>
                      <p className="text-white font-medium">
                        {order.restaurant.name}
                      </p>
                    </div>
                  )}
                </div>

                {/* إجمالي الطلب */}
                <div className="pt-4 border-t border-white/20">
                  <div className="flex justify-between items-center">
                    <span className="text-white font-semibold">
                      {isArabic ? "إجمالي الطلب:" : "Order Total:"}
                    </span>
                    <span className="text-xl font-bold text-yellow-300">
                      {formatPrice(order.total_price || 0)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
