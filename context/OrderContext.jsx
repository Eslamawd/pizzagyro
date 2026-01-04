"use client";
import { addNewOrder, getOrderByUser } from "@/lib/orderApi";
import { createContext, useContext, useState, useEffect } from "react";

const OrderContext = createContext();

export const OrderProvider = ({ children }) => {
  // ✅ كل الطلبات المحفوظة (قديمة + جديدة)
  const [orders, setOrders] = useState(() => {
    const stored = localStorage.getItem("orders");
    return stored ? JSON.parse(stored) : [];
  });

  // ✅ الطلب الحالي اللي المستخدم بيجهزه دلوقتي
  const [currentOrder, setCurrentOrder] = useState(() => {
    const stored = localStorage.getItem("currentOrder");
    return stored
      ? JSON.parse(stored)
      : {
          items: [],
          restaurant_id: null,
          table_id: null,
          status: "pending",
        };
  });

  const [totalPrice, setTotalPrice] = useState(0);

  // ✅ حساب السعر الكلي للطلب الحالي
  useEffect(() => {
    localStorage.setItem("currentOrder", JSON.stringify(currentOrder));

    const total = currentOrder.items.reduce((acc, item) => {
      const itemPrice =
        (parseFloat(item.price || 0) +
          (item.options?.reduce(
            (sum, opt) => sum + parseFloat(opt.price || 0),
            0
          ) || 0)) *
        item.quantity;
      return acc + itemPrice;
    }, 0);

    setTotalPrice(total);
  }, [currentOrder]);

  // ✅ حفظ الطلبات في localStorage
  useEffect(() => {
    localStorage.setItem("orders", JSON.stringify(orders));
  }, [orders]);

  // ✅ إضافة صنف للطلب الحالي
  const addToOrder = (item, quantity = 1, options = [], comment = "") => {
    setCurrentOrder((prev) => {
      const safePrev = prev?.items
        ? prev
        : { items: [], restaurant_id: null, table_id: null, status: "pending" };

      // التحقق مما إذا كان العنصر موجوداً بالفعل بنفس الخيارات
      const existingItemIndex = safePrev.items.findIndex((i) => {
        if (i.id !== item.id) return false;

        // مقارنة الخيارات
        const currentOptions = JSON.stringify(
          i.options?.sort((a, b) => a.id - b.id) || []
        );
        const newOptions = JSON.stringify(options.sort((a, b) => a.id - b.id));

        return currentOptions === newOptions && i.comment === comment;
      });

      if (existingItemIndex >= 0) {
        // زيادة الكمية إذا كان نفس العنصر بنفس الخيارات
        const updatedItems = [...safePrev.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };

        return {
          ...safePrev,
          items: updatedItems,
        };
      }

      // إضافة عنصر جديد
      return {
        ...safePrev,
        items: [
          ...safePrev.items,
          {
            ...item,
            quantity,
            options: options || [],
            comment,
          },
        ],
      };
    });
  };

  // ✅ حذف صنف
  const removeFromOrder = (itemId) => {
    setCurrentOrder((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.id !== itemId),
    }));
  };

  const clearOrderLocal = (orderId) => {
    setOrders((prev) => prev.filter((order) => order.id !== orderId));
  };

  // ✅ تفريغ الطلب الحالي
  const clearOrder = () => {
    setCurrentOrder({
      items: [],
      restaurant_id: null,
      table_id: null,
      status: "pending",
    });
  };

  // ✅ بدء طلب جديد
  const startNewOrder = () => {
    clearOrder();
  };

  // ✅ تعيين المطعم والطاولة
  const setRestaurantId = (id) => {
    setCurrentOrder((prev) => ({ ...prev, restaurant_id: id }));
  };

  const setTableId = (id) => {
    setCurrentOrder((prev) => ({ ...prev, table_id: id }));
  };

  // ✅ تحديث حالة الطلب
  const setStatus = (orderId, status) => {
    setOrders((prev) => {
      const updated = prev.map((o) =>
        o.id === orderId ? { ...o, status } : o
      );
      return updated;
    });
  };

  // ✅ تحديث تعليق عنصر في الطلب الحالي
  const updateItemComment = (itemId, comment) => {
    setCurrentOrder((prev) => ({
      ...prev,
      items: prev.items.map((item) =>
        item.id === itemId ? { ...item, comment } : item
      ),
    }));
  };

  // ✅ تجهيز البيانات للإرسال
  const preparePayload = () => {
    console.log("Preparing payload from currentOrder:", currentOrder);

    return {
      restaurant_id: currentOrder.restaurant_id,
      table_id: currentOrder.table_id,
      items: currentOrder.items.map((item) => ({
        item_id: item.id,
        quantity: item.quantity,
        comment: item.comment || "",
        options: item.options?.map((opt) => opt.id) || [],
      })),
    };
  };

  // ✅ تحديث حالة طلب محدد
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) =>
      prev.map((order) =>
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  // ✅ تحويل استجابة API إلى هيكل متوافق مع التطبيق
  const normalizeOrderResponse = (apiOrder) => {
    return {
      id: apiOrder.id,
      total_price: apiOrder.total_price,
      status: apiOrder.status,
      restaurant_id: apiOrder.restaurant_id,
      table_id: apiOrder.table_id,
      created_at: apiOrder.created_at,
      payment_method: apiOrder.payment_method,
      table: apiOrder.table,
      restaurant: apiOrder.restaurant,
      // تحويل order_items إلى items مع الحفاظ على الهيكل المتوقع
      items:
        apiOrder.order_items?.map((orderItem) => ({
          id: orderItem.item?.id || orderItem.item_id,
          name: orderItem.item?.name,
          name_en: orderItem.item?.name_en,
          price: orderItem.item?.price || orderItem.price,
          image: orderItem.item?.image,
          quantity: orderItem.quantity,
          comment: orderItem.comment,
          options: orderItem.options || [],
          item: orderItem.item, // الاحتفاظ بالبيانات الأصلية إذا لزم الأمر
        })) || [],
    };
  };

  // ✅ إرسال الطلب إلى Laravel
  const submitOrder = async (restaurant_id, user_id, token) => {
    try {
      // التأكد من تعيين restaurant_id و table_id
      if (!currentOrder.restaurant_id || !currentOrder.table_id) {
        console.error("Missing restaurant_id or table_id");
        return null;
      }

      const payload = preparePayload();
      console.log("Submitting order with payload:", payload);

      const res = await addNewOrder(payload, restaurant_id, user_id, token);

      if (res?.id) {
        // تحويل الاستجابة إلى هيكل متوافق
        const normalizedOrder = normalizeOrderResponse(res);

        // تحديث قائمة الطلبات
        setOrders((prev) => {
          const updatedOrders = [...prev, normalizedOrder];
          return updatedOrders;
        });

        // تفريغ الطلب الحالي
        clearOrder();

        console.log("✅ Order Created and Normalized:", normalizedOrder);
        return normalizedOrder;
      }

      console.log("⚠️ No order ID in response:", res);
      return res;
    } catch (err) {
      console.error("❌ Error sending order:", err);
      throw err;
    }
  };

  // ✅ دالة لتحميل الطلبات من الـ API (مثلاً عند التحديث)
  const refreshOrdersFromAPI = async (restaurant_id, user_id, token) => {
    try {
      const apiOrders = await Promise.all(
        orders.map((order) =>
          getOrderByUser(order.id, restaurant_id, user_id, token).catch(
            (err) => {
              console.error(`Error fetching order ${order.id}:`, err);
              return order; // الاحتفاظ بالطلب القديم في حالة الخطأ
            }
          )
        )
      );

      const normalizedOrders = apiOrders
        .filter((order) => order && order.id)
        .map((order) => normalizeOrderResponse(order));

      setOrders(normalizedOrders);
      return normalizedOrders;
    } catch (error) {
      console.error("Error refreshing orders:", error);
      return orders;
    }
  };

  return (
    <OrderContext.Provider
      value={{
        currentOrder,
        orders,
        clearOrderLocal,
        addToOrder,
        removeFromOrder,
        clearOrder,
        startNewOrder,
        setRestaurantId,
        updateOrderStatus,
        setTableId,
        setStatus,
        totalPrice,
        submitOrder,
        updateItemComment,
        refreshOrdersFromAPI,
        normalizeOrderResponse,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
};

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error("useOrder must be used within an OrderProvider");
  }
  return context;
};
