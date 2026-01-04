import { io } from "socket.io-client";

const SOCKET_URL =
  process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001";

let socket = null;

export const connectSocket = () => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      // 💡 تأكد من تفعيل وإعداد خاصية إعادة الاتصال
      reconnection: true, // تفعيل المحاولة التلقائية
      reconnectionAttempts: Infinity, // حاول إلى الأبد
      reconnectionDelay: 1000, // البدء بعد ثانية
      reconnectionDelayMax: 5000, // الحد الأقصى للتأخير 5 ثواني

      // 🚦 التأكد من النقل الصحيح
      transports: ["websocket", "polling"],
    });
  } else if (!socket.connected) {
    socket.connect();
  }
  return socket;
};

export const onSocketConnect = (callback) => {
  // التأكد من أن socket موجود
  if (socket) {
    // الاستماع لحدث 'connect' الذي يحدث عند اكتمال الاتصال
    socket.on("connect", callback);
  }
};

export const disconnectSocket = () => {
  if (socket?.connected) {
    socket.disconnect();
  }
};

// 🛑 التعديل هنا: إضافة (callback)
export const joinKitchen = (restaurant_id, callback) => {
  // نمرر الـ callback إلى الخادم
  socket?.emit("joinKitchen", { restaurant_id }, callback);
};

export const joinCashier = (restaurant_id, callback) => {
  socket?.emit("joinCashier", { restaurant_id }, callback);
};

export const joinOrder = (order_id) => {
  socket?.emit("joinOrder", { order_id });
};

export const onNewOrder = (callback) => {
  // ملاحظة: يجب إزالة المستمع القديم قبل إضافة مستمع جديد لتجنب التكرار في useEffect
  socket?.off("new_order");
  socket?.on("new_order", callback);
};

export const onOrderUpdated = (callback) => {
  socket?.off("order_updated");
  socket?.on("order_updated", callback);
};
