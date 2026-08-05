import React, { useEffect, useRef, useState } from "react";
import { getOrdersByCashier, updateOrderByCashier } from "@/lib/orderApi";
import {
  connectSocket,
  joinCashier,
  onNewOrder,
  onOrderUpdated,
  disconnectSocket,
} from "@/services/socket";
import { toast } from "sonner";
import { MapPin, Phone } from "lucide-react";

function DelivryManagment({ kitchen, restaurant_id, user_id, token }) {
  const [orders, setOrders] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const socketRef = useRef(null);
  const audioRef = useRef(null);

  // ✅ طلب إذن الإشعارات مرة واحدة فقط
  useEffect(() => {
    if ("Notification" in window) {
      Notification.requestPermission();
    }
  }, []);

  // ✅ تفعيل الصوت لتجاوز autoplay restriction
  const enableSound = async () => {
    try {
      audioRef.current.muted = true;
      await audioRef.current.play();
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.muted = false;
      setSoundEnabled(true);
    } catch (err) {
      console.warn("🔇 Sound cannot be played automatically: ", err);
    }
  };

  // ✅ تحميل الطلبات من الـ API
  const getOrders = async () => {
    try {
      const data = await getOrdersByCashier(
        kitchen,
        restaurant_id,
        user_id,
        token
      );

      if (data?.active === false) {
        toast.error("⚠️ Subscription expired: ");
        return;
      }

      const sorted = data.sort(
        (a, b) =>
          new Date(b.created_at ?? 0).getTime() -
          new Date(a.created_at ?? 0).getTime()
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
      await updateOrderByCashier(
        orderId,
        kitchen,
        restaurant_id,
        user_id,
        token,
        { status }
      );

      // ✅ تحديث فوري محلي
      setOrders((prev) => {
        const updated = prev.map((order) =>
          order.id === orderId ? { ...order, status } : order
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
    // 1. تشغيل الصوت
    if (soundEnabled && audioRef.current) {
      audioRef.current.currentTime = 0;

      // 🚀 التعديل الهام: استخدام .then().catch() لضمان معالجة فشل التشغيل التلقائي
      const tryPlaySound = (attempt = 1) => {
        audioRef.current
          .play()
          .then(() => {
            // التشغيل نجح
            console.log(
              `🔔 The notification sound was enabled on attempt number${attempt}.`
            );
          })
          .catch((err) => {
            // ❌ فشل التشغيل
            console.warn(`🔇 Failed to play sound on attempt ${attempt}:`, err);

            // **🚨 المحاولة الثانية المؤجلة (Retrial Logic)**
            if (attempt === 1) {
              console.log("🔄 Second attempt to play sound after 500 ms...");
              setTimeout(() => {
                tryPlaySound(2); // المحاولة الثانية
              }, 500);
            }
          });
      };

      // ابدأ بالمحاولة الأولى
      tryPlaySound(1);
    }

    // 2. الإشعار التقليدي
    if (Notification.permission === "granted") {
      new Notification("🍔 New Order", {
        body: `Order Number : ${order.id}`,
        icon: "/qregylogo_192x192.png",
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

  // ✅ إعداد WebSocket
  useEffect(() => {
    getOrders();

    const socket = connectSocket();
    socketRef.current = socket;

    const handleConnect = () => {
      console.log("✅ Socket connected. Joining kitchen...");
      joinCashier(restaurant_id, (response) => {
        console.log("✅ Joined room:", response.room);

        socket.off("newOrder");
        socket.off("orderUpdated");

        onOrderUpdated(({ order_id, status }) => {
          setOrders((prev) => {
            const updated = prev.map((o) =>
              o.id === order_id ? { ...o, status } : o
            );
            return updated.sort((a, b) => b.id - a.id);
          });
        });

        onNewOrder((order) => {
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
      socket.off("connect", handleConnect);
      socket.off("newOrder");
      socket.off("orderUpdated");
      disconnectSocket();
    };
  }, []);

  return (
    <main dir="ltr" className="min-h-screen text-white p-6">
      <h1 className="text-3xl font-bold mb-6 text-center">
        Delivary Management Dashboard
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
      <audio ref={audioRef} preload="auto">
        <source src="/sounds/ding.mp3" type="audio/mpeg" />
        <source src="/sounds/ding.ogg" type="audio/ogg" />
      </audio>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {orders?.map(
          (order) =>
            order.latitude && (
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
                        : order.status === "delivered"
                        ? "bg-blue-500"
                        : "bg-green-500 text-black"
                    }`}
                  >
                    {order.status === "pending"
                      ? "Pending"
                      : order.status === "in_progress"
                      ? "In Progress"
                      : order.status === "cancelled"
                      ? "Cancelled"
                      : order.status === "delivered"
                      ? "Delivered"
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

                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${order.latitude},${order.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-orange-100 hover:underline"
                    >
                      <MapPin className="inline-block text-orange-100 mr-1 mb-1" />
                    </a>
                  </p>
                  <p>
                    Phone: {order.phone}
                    <a
                      href={`tel:${order.phone}`}
                      className="text-sm text-orange-100 hover:underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Phone className="inline-block text-orange-100 mr-1 mb-1" />
                    </a>
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
                  {order.status === "ready" && (
                    <button
                      onClick={() => updateStatus(order.id, "delivered")}
                      className="bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded w-full"
                    >
                      Delivered
                    </button>
                  )}
                  {order.status === "delivered" && (
                    <button
                      onClick={() => updateStatus(order.id, "payid")}
                      className="bg-green-500 hover:bg-green-600 text-black px-3 py-2 rounded w-full"
                    >
                      Pay
                    </button>
                  )}
                </div>
              </div>
            )
        )}

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

export default DelivryManagment;
