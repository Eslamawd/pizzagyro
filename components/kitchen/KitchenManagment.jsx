import React, { useEffect, useRef, useState } from "react";
import { getOrdersByKitchen, updateOrderByKitchen } from "@/lib/orderApi";
import {
  connectSocket,
  joinKitchen,
  onNewOrder,
  onOrderUpdated,
  disconnectSocket,
} from "@/services/socket";
import {
  initFirebaseWebPush,
  subscribeFirebaseForegroundMessages,
} from "@/lib/firebaseWebPush";
import { toast } from "sonner";

function KitchenManagment({ kitchen, restaurant_id, user_id, token }) {
  const [orders, setOrders] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [isAlertRinging, setIsAlertRinging] = useState(false);
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const vibrationIntervalRef = useRef(null);
  const notifiedEventsRef = useRef(new Map());

  const markNotificationEvent = (eventKey) => {
    const now = Date.now();
    const lastAt = notifiedEventsRef.current.get(eventKey) || 0;

    if (now - lastAt < 4000) {
      return false;
    }

    notifiedEventsRef.current.set(eventKey, now);
    return true;
  };

  // ✅ طلب إذن الإشعارات مرة واحدة فقط
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // ✅ تفعيل الصوت لتجاوز autoplay restriction
  const enableSound = async () => {
    try {
      if ("Notification" in window && Notification.permission === "default") {
        await Notification.requestPermission();
      }

      audioRef.current.muted = true;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.loop = false;
      audioRef.current.muted = false;
      setSoundEnabled(true);
    } catch (err) {
      console.warn("🔇 Sound cannot be played automatically: ", err);
    }
  };

  const startPersistentAlert = () => {
    if (!soundEnabled || !audioRef.current) return;

    audioRef.current.loop = true;
    audioRef.current.currentTime = 0;
    audioRef.current.play().catch((err) => {
      console.warn("🔇 Failed to start persistent alert sound:", err);
    });

    if ("vibrate" in navigator) {
      navigator.vibrate([500, 250, 500]);
      if (!vibrationIntervalRef.current) {
        vibrationIntervalRef.current = setInterval(() => {
          navigator.vibrate([500, 250, 500]);
        }, 2000);
      }
    }

    setIsAlertRinging(true);
  };

  const stopPersistentAlert = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.loop = false;
    }

    if (vibrationIntervalRef.current) {
      clearInterval(vibrationIntervalRef.current);
      vibrationIntervalRef.current = null;
    }

    if ("vibrate" in navigator) {
      navigator.vibrate(0);
    }

    setIsAlertRinging(false);
  };

  // ✅ تحميل الطلبات من الـ API
  const getOrders = async () => {
    try {
      const data = await getOrdersByKitchen(
        kitchen,
        restaurant_id,
        user_id,
        token,
      );

      if (data?.active === false) {
        toast.error("⚠️ Subscription expired: ");
        return;
      }

      const sorted = data.sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime(),
      );
      setOrders(sorted);
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("Failed to fetch orders.");
    }
  };

  // ✅ تحديث حالة الطلب
  const updateStatus = async (orderId, status) => {
    try {
      await updateOrderByKitchen(
        orderId,
        kitchen,
        restaurant_id,
        user_id,
        token,
        { status },
      );

      stopPersistentAlert();

      // ✅ تحديث فوري محلي
      setOrders((prev) => {
        const updated = prev.map((order) =>
          order.id === orderId ? { ...order, status } : order,
        );
        // حذف الطلب من القائمة بعد التجهيز
        return status === "ready"
          ? updated.filter((order) => order.id !== orderId)
          : updated;
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast.error("Failed to update order status.");
    }
  };

  // ✅ إشعارات + صوت + نطق
  // ✅ إشعارات + صوت + نطق (مُحسَّن لـ iOS/Safari)
  const handleNotifyNewOrder = (order) => {
    // رنين مستمر لا يتوقف إلا بالزر.
    startPersistentAlert();

    // 2. الإشعار التقليدي
    if (Notification.permission === "granted") {
      new Notification("🍔 New Order", {
        body: `Order Number : ${order.id}`,
        icon: "/qregylogo_192x192.png",
        tag: "kitchen-new-order",
        renotify: true,
        requireInteraction: true,
        vibrate: [500, 200, 500],
      });
    }

    // 3. النطق الصوتي (Speech Synthesis)
    if ("speechSynthesis" in window) {
      const utt = new SpeechSynthesisUtterance(`New Order Number ${order.id}`);
      utt.lang = "en-US";
      utt.rate = 0.9;
      utt.pitch = 1;
      const voice = speechSynthesis
        .getVoices()
        .find((v) => v.lang.startsWith("en"));
      if (voice) utt.voice = voice;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utt);
    }
  };

  useEffect(() => {
    let unsubscribe = () => {};

    const bindFirebase = async () => {
      const result = await initFirebaseWebPush("web-kitchen");

      if (!result.enabled) {
        return;
      }

      unsubscribe = await subscribeFirebaseForegroundMessages((payload) => {
        const data = payload?.data || {};
        const eventType = String(data.event || "new_order").toLowerCase();
        const orderId = Number(data.order_id || data.orderId || 0);

        if (!orderId) {
          return;
        }

        if (!markNotificationEvent(`firebase-${eventType}-${orderId}`)) {
          return;
        }

        handleNotifyNewOrder({ id: orderId });
        toast.success(`🔔 Firebase alert for order #${orderId}`);
        getOrders();
      });
    };

    bindFirebase().catch((error) => {
      console.warn("Firebase push setup failed:", error);
    });

    return () => {
      unsubscribe?.();
    };
  }, []);

  // ✅ إعداد WebSocket
  useEffect(() => {
    getOrders();

    const socket = connectSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      console.log("✅ Socket connected. Joining kitchen...");
      onOrderUpdated(({ order_id, status }) => {
        if (
          order_id &&
          markNotificationEvent(`socket-order-updated-${order_id}`)
        ) {
          handleNotifyNewOrder({ id: order_id });
        }

        setOrders((prev) => {
          const updated = prev.map((o) =>
            o.id === order_id ? { ...o, status } : o,
          );
          return updated.sort((a, b) => b.id - a.id);
        });
      });

      onNewOrder((order) => {
        if (!markNotificationEvent(`socket-new-order-${order.id}`)) {
          return;
        }

        toast.success(`🔔 New order! Table ${order.table?.name ?? order.id}`);
        setOrders((prev) => {
          const exists = prev.some((o) => o.id === order.id);
          const updated = exists
            ? prev.map((o) => (o.id === order.id ? order : o))
            : [...prev, order];
          return updated.sort((a, b) => b.id - a.id);
        });
        handleNotifyNewOrder(order);
      });

      joinKitchen(restaurant_id, (response) => {
        console.log("✅ Joined room:", response?.room || "kitchen room");
      });
    };

    socket.on("connect", handleConnect);

    // ✅ Fallback Polling كل 10 دقايق
    const intervalId = setInterval(() => {
      if (!socket.connected) {
        console.log("🔄 Socket disconnected. Polling orders...");
        getOrders();
      }
    }, 600000);

    return () => {
      clearInterval(intervalId);
      stopPersistentAlert();
      socket.off("connect", handleConnect);
      socket.off("new_order");
      socket.off("newOrder");
      socket.off("order_updated");
      socket.off("orderUpdated");
      disconnectSocket();
    };
  }, []);

  return (
    <main dir="ltr" className="min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        🍳 Kitchen Management Dashboard
      </h1>

      <p className="text-center text-sm text-gray-400 mb-6">
        Connection status:{" "}
        {socketRef.current?.connected ? (
          <span className="text-green-400">✅ Online (instant)</span>
        ) : (
          <span className="text-red-400">❌ Offline (polling only)</span>
        )}
      </p>

      {!soundEnabled && (
        <div className="mb-4 text-center">
          <button
            onClick={enableSound}
            className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg shadow-md"
          >
            Enable Notification Sound
          </button>
          <p className="text-sm text-gray-300 mt-2">
            Click once to enable sound, speech, and notifications
          </p>
        </div>
      )}
      {isAlertRinging && (
        <div className="mb-4 text-center">
          <button
            onClick={stopPersistentAlert}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg shadow-md font-semibold"
          >
            Stop Alert
          </button>
          <p className="text-sm text-red-300 mt-2">
            New order alarm is running. Press Stop Alert to silence it.
          </p>
        </div>
      )}
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/ding.mp3" type="audio/mpeg" />
        <source src="/sounds/ding.ogg" type="audio/ogg" />
      </audio>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {orders?.map((order) => {
          const customerName =
            order.customer_name || order.customerName || order.name || "N/A";
          const scheduledFor =
            order.scheduled_for ||
            [order.scheduled_date, order.scheduled_time]
              .filter(Boolean)
              .join(" ") ||
            "N/A";
          const tipPercentage =
            order.tip_percentage ?? order.tipPercentage ?? order.tip_percent;
          const tipAmount = order.tips ?? order.tip_amount ?? order.tipAmount;

          return (
            <div
              key={order.id}
              className="bg-gray-900 rounded-xl shadow-md p-4 border border-gray-700 hover:shadow-yellow-400/20 transition-all duration-300"
            >
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold">Order #{order.id}</h2>
                <span
                  className={`text-xs font-semibold px-2 py-1 rounded ${
                    order.status === "pending"
                      ? "bg-red-500"
                      : order.status === "in_progress"
                        ? "bg-yellow-500 text-black"
                        : order.status === "cancelled"
                          ? "bg-gray-600"
                          : "bg-green-500 text-black"
                  }`}
                >
                  {order.status === "pending"
                    ? "Pending"
                    : order.status === "in_progress"
                      ? "In Progress"
                      : order.status === "cancelled"
                        ? "Cancelled"
                        : "Ready"}
                </span>
              </div>

              <div className="mb-2 text-sm text-gray-300">
                <p>
                  {order.table?.name
                    ? `Table: ${order.table?.name}`
                    : order.address
                      ? `Delivery: ${order.address}`
                      : "N/A"}
                </p>
                <p>
                  <strong>Customer:</strong> {customerName}
                </p>
                <p>
                  <strong>Receive At:</strong> {scheduledFor}
                </p>
                <p>
                  <strong>Tips:</strong>{" "}
                  {tipPercentage != null ? `${tipPercentage}%` : "N/A"}
                  {tipAmount != null ? ` (${tipAmount}$)` : ""}
                </p>
                <p>
                  <strong>Total:</strong> {order.total_price} $
                </p>
                <p className="text-sm font-semibold text-yellow-400 mb-2">
                  Items List:
                </p>
              </div>

              <div className="mb-4 max-h-56 overflow-y-auto custom-scrollbar">
                {order.order_items?.map((item, i) => (
                  <div
                    key={i}
                    className="bg-gray-800 p-2 rounded-lg mb-2 flex items-center gap-3"
                  >
                    <img
                      src={item.item?.image ?? "/placeholder.png"}
                      alt={item.item?.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                    <div>
                      <p className="font-medium">{item.item?.name}</p>
                      <p className="text-l text-orange-400">
                        Quantity: {item.quantity}
                      </p>
                      {item.comment && (
                        <p className="text-xs text-yellow-400 italic">
                          Note: {item.comment}
                        </p>
                      )}
                      {item.options?.length > 0 && (
                        <div className="text-xs mt-1">
                          <p className="text-yellow-400 font-semibold mb-1">
                            Options:
                          </p>
                          <div className="flex flex-wrap items-center gap-2">
                            {item.options.map((opt, idx) => (
                              <div
                                key={opt.id}
                                className="flex w-full items-center"
                              >
                                {opt.pivot?.position === "right" && (
                                  <span className="flex items-center justify-center bg-orange-600 text-white text-[10px] font-bold w-10 h-5 rounded shadow-sm">
                                    RIGHT
                                  </span>
                                )}
                                {opt.pivot?.position === "left" && (
                                  <span className="flex items-center justify-center bg-blue-600 text-white text-[10px] font-bold w-10 h-5 rounded shadow-sm">
                                    LEFT
                                  </span>
                                )}
                                {opt.pivot?.position === "whole" && (
                                  <span className="flex items-center justify-center bg-green-700 text-white text-[10px] font-bold w-10 h-5 rounded shadow-sm">
                                    ALL
                                  </span>
                                )}
                                <p className="text-white/80">
                                  <strong className="text-lg text-orange-400">
                                    {" "}
                                    {opt.option_type}{" "}
                                  </strong>
                                  : {opt.name}{" "}
                                  {opt.price ? `(+${opt.price}$)` : ""}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                {order.status === "pending" && (
                  <button
                    onClick={() => updateStatus(order.id, "in_progress")}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded w-full"
                  >
                    In Progress
                  </button>
                )}
                {order.status === "in_progress" && (
                  <button
                    onClick={() => updateStatus(order.id, "ready")}
                    className="bg-green-500 hover:bg-green-600 text-black px-3 py-2 rounded w-full"
                  >
                    Ready for Delivery
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {orders.length === 0 && (
          <div className="md:col-span-3 text-center text-gray-500 py-10">
            <p className="text-xl">No orders currently</p>
            <p className="text-sm">The screen will update automatically.</p>
          </div>
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #facc15;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #374151;
        }
      `}</style>
    </main>
  );
}

export default KitchenManagment;
