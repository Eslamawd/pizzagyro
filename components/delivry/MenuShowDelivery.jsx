"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  X,
  Navigation,
  Loader2,
  ShoppingCart,
  Plus,
  ArrowRight,
  Minus,
  Trash2,
  Pizza,
  Utensils,
  Drumstick,
  Coffee,
  GlassWater,
} from "lucide-react";
import { toast } from "sonner";
import { RESTAURANT_DATA } from "./RestaurantData";
import LocationPicker from "./LocationPicker";
import CloverPayment from "./CloverPayment";
import { getMenus } from "@/lib/menuApi";
import { addNewOrderDelivery } from "@/lib/orderApi";

const OPTION_GROUP_CONFIG = {
  size: { type: "single", required: true },
  dough: { type: "single", required: true },
  sauce: { type: "single", required: true },
  filling: { type: "single", required: false },
  spice_level: { type: "single", required: false },
  topping: { type: "multiple", required: false },
  extra: { type: "multiple", required: false, max: 5 },
  other: { type: "multiple", required: false, max: 5 },
};

const DELIVERY_RADIUS_MILES = 5.5;
const MANUAL_RESTAURANT_LOCATION = {
  lat: 36.01244975,
  lng: 86.5487051,
};

const normalizeCoordinate = (value) => {
  const numericValue =
    typeof value === "string" ? parseFloat(value) : Number(value);
  return Number.isFinite(numericValue) ? numericValue : null;
};

const normalizePhoneDigits = (value) =>
  (value || "").toString().replace(/\D/g, "");

const normalizeUSPhone = (value) => {
  const digits = normalizePhoneDigits(value);
  if (digits.length === 11 && digits.startsWith("1")) {
    return digits.slice(1);
  }
  return digits;
};

const isValidUSPhone = (value) => {
  const normalized = normalizeUSPhone(value);
  return /^[2-9]\d{2}[2-9]\d{6}$/.test(normalized);
};

const MenuShowDelivery = () => {
  // --- States ---
  const [cart, setCart] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedOptions, setSelectedOptions] = useState({});

  const [showCart, setShowCart] = useState(false);
  const [location, setLocation] = useState({
    address: "",
    lat: null,
    lng: null,
    isSet: false,
  });
  const [phone, setPhone] = useState("");
  const [showLocModal, setShowLocModal] = useState(false);
  const [menus, setMenus] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentToken, setPaymentToken] = useState(null);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);

  useEffect(() => {
    const fetchLocation = async (lat, lng) => {
      try {
        const res = await fetch(
          `/api/geocode/reverse?lat=${lat}&lon=${lng}&language=en`,
        );
        if (!res.ok) throw new Error("Failed to fetch address");
        const data = await res.json();
        const a = data.address || {};
        const address =
          a.neighbourhood ||
          a.suburb ||
          a.city_district ||
          a.town ||
          a.city ||
          " Your location";
        setLocation({ lat, lng, address, isSet: true });
      } catch (err) {
        console.log("Error fetching location:", err);
        setLocation({ lat, lng, address: "Your location", isSet: true });
      }
    };

    if (!location.isSet && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          fetchLocation(lat, lng);
        },
        (err) => {
          console.log("Please enable GPS", err);
          setLocation({
            lat: null,
            lng: null,
            address: " Your location",
            isSet: true,
          });
        },
        { enableHighAccuracy: true, timeout: 10000 },
      );
    }
  }, []);

  const getMenusApi = async () => {
    try {
      const response = await getMenus();
      setMenus(response);
    } catch (error) {
      toast.error("Failed to load menus. Please try again.");
    }
  };

  useEffect(() => {
    getMenusApi();
  }, []);

  const calculateItemTotal = (item, selectedOptions = {}) => {
    // 1. نبدأ بسعر البيتزا الأساسي (لو السايز له سعر مختلف يفضل استخدامه هنا)
    let total = Number(item.price || 0);

    if (item.options_grouped) {
      Object.entries(item.options_grouped).forEach(([groupKey, options]) => {
        const selected = selectedOptions[groupKey];
        if (!selected) return;

        const getToppingPrice = (originalPrice) => {
          let p = Number(originalPrice || 0);

          // التصحيح هنا: نتحقق إذا كان الجروب هو توبينج أو إكسترا
          if (groupKey === "topping" || groupKey === "extra") {
            const currentSize = selectedOptions.size?.name?.toLowerCase() || "";

            if (currentSize === "m" || currentSize === "medium") p += 0.25;
            else if (currentSize === "l" || currentSize === "large") p += 0.5;
            else if (currentSize.includes("xl")) p += 0.75;
          }
          return p;
        };

        // تحويل المختار إلى مصفوفة للتعامل الموحد
        const selectedArray = Array.isArray(selected) ? selected : [selected];

        selectedArray.forEach((optionObj) => {
          if (!optionObj) return;

          // استخراج الـ ID سواء كان المختار Object أو ID مباشر
          const targetId =
            typeof optionObj === "object" ? optionObj.id : optionObj;
          const opt = options.find((o) => o.id == targetId);

          if (opt) {
            total += getToppingPrice(opt.price);
          }
        });
      });
    }

    return total.toFixed(2);
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 3958.8; // نصف قطر الأرض بالأميال
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // المسافة بالأميال
  };

  // --- دالات السلة المحسنة ---// --- دالات السلة المحسنة ---
  const addToCart = (item, selectedOptions = {}) => {
    const size = selectedOptions.size;
    const finalPrice = calculateItemTotal(item, selectedOptions);

    const optionsKey = Object.entries(selectedOptions)
      .map(([key, val]) => {
        if (!val) return `${key}:none`; // handle null or undefined
        if (Array.isArray(val))
          return `${key}:${val.map((v) => v?.id || "none").join("-")}`;
        if (typeof val === "object") return `${key}:${val.id || "none"}`;
        return `${key}:${val}`;
      })
      .join("|");

    const cartItemId = `${item.id}-${optionsKey}`;

    let displayName = item.name;
    if (size) {
      const sizeName =
        item.options_grouped.size.find((s) => s.id === size)?.name || size;
      displayName += ` (${sizeName})`;
    }

    // options details بدون تغيير
    const optionDetails = {};
    Object.entries(selectedOptions).forEach(([groupKey, value]) => {
      if (!value) return;

      // ✅ لو value رقم (زي size)
      if (typeof value === "number") {
        optionDetails[groupKey] = {
          id: value,
          position: "whole",
          name: value.name,
          price: value.price,
        };
        return;
      }

      if (Array.isArray(value)) {
        optionDetails[groupKey] = value.map((v) => ({
          id: v.id,
          position: v.position || "whole",
          price: Number(v?.price || 0),
          name: v.name,
        }));
      } else if (value?.id) {
        optionDetails[groupKey] = {
          id: value.id,
          name: value.name,
          price: Number(value?.price || 0),
          position: value.position || "whole",
        };
      }
    });

    setCart((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing)
        return prev.map((i) =>
          i.id === cartItemId ? { ...i, qty: i.qty + 1 } : i,
        );

      return [
        ...prev,
        {
          id: cartItemId,
          item_id: item.id,
          name: displayName,
          image: item.image,
          price: finalPrice,
          qty: 1,
          options: optionDetails,
        },
      ];
    });

    setSelectedItem(null);
    setSelectedOptions({});
    toast.success(`Added ${displayName} 🍽️`);
  };

  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: Math.max(1, item.qty + delta) }
            : item,
        )
        .filter((item) => item.qty > 0),
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const canProceedToPayment = () => {
    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return false;
    }

    if (cartTotal < 25) {
      toast.error(
        "Minimum order amount is $25. Please add more items to your cart.",
      );
      return false;
    }

    if (!location.isSet || !location.address) {
      toast.error("Please set your delivery location first!");
      setShowCart(false);
      setShowLocModal(true);
      return false;
    }

    const customerLat = normalizeCoordinate(location.lat);
    const customerLng = normalizeCoordinate(location.lng);

    if (customerLat === null || customerLng === null) {
      toast.error("Invalid customer location. Please reselect your location.");
      setShowCart(false);
      setShowLocModal(true);
      return false;
    }

    const restaurantCoordinates = {
      lat: normalizeCoordinate(MANUAL_RESTAURANT_LOCATION.lat),
      lng: normalizeCoordinate(MANUAL_RESTAURANT_LOCATION.lng),
    };

    if (
      restaurantCoordinates.lat === null ||
      restaurantCoordinates.lng === null
    ) {
      toast.error(
        "Restaurant location is unavailable. Please contact support.",
      );
      return false;
    }

    const distance = calculateDistance(
      restaurantCoordinates.lat,
      restaurantCoordinates.lng,
      customerLat,
      customerLng,
    );

    if (distance > DELIVERY_RADIUS_MILES) {
      toast.error(
        `Sorry, we only deliver within ${DELIVERY_RADIUS_MILES} miles. Your distance is ${distance.toFixed(1)} miles.`,
      );
      return false;
    }

    if (!phone?.trim()) {
      toast.error("Please enter your phone number.");
      return false;
    }

    if (!isValidUSPhone(phone)) {
      toast.error(
        "Please enter a valid US phone number (example: +1 615 555 1234).",
      );
      return false;
    }

    return true;
  };

  const newOrderDelivery = async (token = null) => {
    if (!location.isSet || !location.address) {
      toast.error("Please set your delivery location first!");
      setShowCart(false);
      setShowLocModal(true);
      return;
    }

    const customerLat = normalizeCoordinate(location.lat);
    const customerLng = normalizeCoordinate(location.lng);

    if (customerLat === null || customerLng === null) {
      toast.error("Invalid customer location. Please reselect your location.");
      setShowCart(false);
      setShowLocModal(true);
      return;
    }

    const restaurantCoordinates = {
      lat: normalizeCoordinate(MANUAL_RESTAURANT_LOCATION.lat),
      lng: normalizeCoordinate(MANUAL_RESTAURANT_LOCATION.lng),
    };

    if (
      restaurantCoordinates.lat === null ||
      restaurantCoordinates.lng === null
    ) {
      toast.error(
        "Restaurant location is unavailable. Please contact support.",
      );
      return;
    }

    // --- الجزء الجديد: فحص المسافة ---
    const distance = calculateDistance(
      restaurantCoordinates.lat,
      restaurantCoordinates.lng,
      customerLat,
      customerLng,
    );

    if (cartTotal < 25) {
      toast.error(
        "Minimum order amount is $25. Please add more items to your cart.",
      );
      return;
    }

    if (distance > DELIVERY_RADIUS_MILES) {
      toast.error(
        `Sorry, we only deliver within ${DELIVERY_RADIUS_MILES} miles. Your distance is ${distance.toFixed(1)} miles.`,
      );
      return;
    }

    if (!phone?.trim()) {
      toast.error("Please enter your phone number.");
      setShowCart(false);
      return;
    }

    if (!isValidUSPhone(phone)) {
      toast.error(
        "Please enter a valid US phone number (example: +1 615 555 1234).",
      );
      setShowCart(false);
      return;
    }

    const normalizedPhone = normalizeUSPhone(phone);

    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    // تأكد من أن menus موجود ولديه restaurant_id
    if (!menus || menus.length === 0) {
      toast.error("No restaurant data available!");
      return;
    }

    setIsProcessingOrder(true);

    try {
      // تحضير بيانات الطلب
      const orderData = {
        restaurant_id: menus[0]?.restaurant_id || 1,
        address: location.address,
        latitude: customerLat,
        longitude: customerLng,
        phone: normalizedPhone,
        items: cart.map((item) => {
          const formattedOptions = [];

          if (item.options) {
            Object.values(item.options).forEach((opt) => {
              if (Array.isArray(opt)) {
                opt.forEach((o) => {
                  formattedOptions.push({
                    id: o.id,
                    position: o.position || "whole",
                  });
                });
              } else if (opt?.id) {
                formattedOptions.push({
                  id: opt.id,
                  position: opt.position || "whole",
                });
              }
            });
          }

          return {
            item_id: item.item_id || parseInt(item.id),
            quantity: item.qty,
            price: item.price,
            options: formattedOptions,
          };
        }),

        total_price: cartTotal.toFixed(2),
        payment_token: token, // 💳 الـ token مع الـ order
      };

      console.log("Order data:", JSON.stringify(orderData, null, 2));

      // 🔄 بعت الـ order مع الـ token في نفس الـ request
      const response = await addNewOrderDelivery(orderData);

      toast.success(`${response.message} 🎉`);
      setShowCart(false);
      setCart([]);
      setSelectedItem(null);
      setSelectedOptions({});
      setShowPaymentModal(false);
      setPaymentToken(null);
      toast.success("Order created successfully! 🎉");
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || error.message || "Error";

      toast.error(`Failed to create order: ${errorMessage}`);

      setShowPaymentModal(false);
    } finally {
      setIsProcessingOrder(false);
    }
  };
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleOptionSelect = (
    groupKey,
    optionId,
    position = "whole",
    name,
    price,
  ) => {
    const config = OPTION_GROUP_CONFIG[groupKey] || { type: "single" };

    if (config.type === "multiple") {
      const current = selectedOptions[groupKey] || [];
      const existingOption = current.find((o) => o.id === optionId);

      // إذا كان المستخدم يحاول إضافة خيار جديد (وليس تعديل خيار موجود)
      if (!existingOption && current.length >= (config.max || Infinity)) {
        toast.error(
          `Maximum ${config.max} options allowed for ${groupKey.replace("_", " ")}`,
        );
        return; // نخرج ولا نحدث الحالة
      }
    }
    setSelectedOptions((prev) => {
      if (config.type === "multiple") {
        const current = prev[groupKey] || [];
        // البحث عن الخيار داخل المصفوفة
        const existingOptionIndex = current.findIndex((o) => o.id === optionId);

        if (existingOptionIndex > -1) {
          // إذا كان المستخدم يضغط على خيار موجود أصلاً
          const existingOption = current[existingOptionIndex];

          // لو ضغط على نفس الـ position الحالي -> نحذف الخيار (Toggle off)
          if (existingOption.position === position) {
            return {
              ...prev,
              [groupKey]: current.filter((o) => o.id !== optionId),
            };
          }

          // لو اختار position مختلف (مثلاً كان يمين وخلاه شمال) -> نحدث الـ position فقط
          const updatedOptions = [...current];
          updatedOptions[existingOptionIndex] = {
            id: optionId,
            position: position,
            name: name,
            price: price,
          };
          return { ...prev, [groupKey]: updatedOptions };
        }

        // إضافة خيار جديد لأول مرة
        return {
          ...prev,
          [groupKey]: [
            ...current,
            { id: optionId, position: position, name: name, price: price },
          ],
        };
      }

      // المنطق الخاص بالـ Single Selection (مثل الحجم أو العجينة)
      const currentSingle = prev[groupKey];
      // إذا كان الخيار المختار هو نفسه الموجود حالياً وبنفس الـ position -> نلغيه
      if (
        currentSingle?.id === optionId &&
        currentSingle?.position === position
      ) {
        return { ...prev, [groupKey]: null };
      }

      return {
        ...prev,
        [groupKey]: {
          id: optionId,
          position: position,
          name: name,
          price: price,
        },
      };
    });
  };

  // --- أيقونات حسب نوع القائمة ---
  const getMenuIcon = (menuName) => {
    if (menuName.includes("Pizza"))
      return <Pizza className="text-orange-500" />;
    if (menuName.includes("Gyro"))
      return <Utensils className="text-green-500" />;
    if (menuName.includes("Calzones"))
      return <Drumstick className="text-red-500" />;
    if (menuName.includes("Wings"))
      return <Drumstick className="text-yellow-500" />;
    if (menuName.includes("Drinks"))
      return <Coffee className="text-blue-500" />;
    return <Utensils className="text-purple-500" />;
  };

  // --- عند اختيار عنصر جديد، نضبط الحجم الافتراضي ---
  useEffect(() => {
    if (selectedItem && selectedItem.options_grouped?.size) {
      const defaultSize = selectedItem.options_grouped.size[0];
      setSelectedOptions((prev) => ({
        ...prev,
        size: {
          id: defaultSize.id,
          name: defaultSize.name,
          price: defaultSize.price,
          position: "whole",
        },
      }));
    }
  }, [selectedItem]);

  const renderCartOptions = (item) => {
    if (!item.options || Object.keys(item.options).length === 0) return null;

    return (
      <div className="text-xs text-slate-500 mt-1 space-y-0.5">
        {Object.entries(item.options).map(([groupKey, value]) => {
          if (!value) return null;

          // ===== MULTIPLE OPTIONS =====
          if (Array.isArray(value)) {
            return value.map((v, idx) => (
              <p key={`${groupKey}-${idx}`}>
                {groupKey.replace("_", " ")}:
                <span className="font-medium ml-1">{v.name}</span>
                {Number(v.price) > 0 && (
                  <span className="text-orange-500 ml-1">
                    (+${Number(v.price).toFixed(2)})
                  </span>
                )}
                {v.position && v.position !== "whole" && (
                  <span className="text-slate-400 ml-1">[{v.position}]</span>
                )}
              </p>
            ));
          }

          // ===== SINGLE OPTION =====
          return (
            <p key={groupKey}>
              {groupKey.replace("_", " ")}:
              <span className="font-medium ml-1">{value.name}</span>
              {Number(value.price) > 0 && (
                <span className="text-orange-500 ml-1">
                  (+${Number(value.price).toFixed(2)})
                </span>
              )}
              {value.position && value.position !== "whole" && (
                <span className="text-slate-400 ml-1">[{value.position}]</span>
              )}
            </p>
          );
        })}
      </div>
    );
  };

  return (
    <section className="min-h-screen mt-30 w-full pb-32 font-sans">
      {/* 1. شريط الموقع */}
      <div className="px-4 py-6 sticky top-16 z-40 ">
        <motion.div
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowLocModal(true)}
          className="max-w-xl mx-auto border border-orange-100 shadow-xl rounded-2xl p-3 flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center gap-3 px-2">
            <div
              className={`p-2 rounded-xl ${
                location.isSet ? "bg-green-500" : "bg-orange-500"
              } text-white shadow-lg`}
            >
              <MapPin size={22} />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                Delivery to
              </p>
              <p className="text-sm font-black text-slate-800 truncate max-w-[200px]">
                {location.address || "Set your location"}
              </p>
            </div>
          </div>
          <div className="bg-slate-50 p-2 rounded-full">
            <Navigation size={18} className="text-orange-500" />
          </div>
        </motion.div>
      </div>

      {/* 2. القائمة الرئيسية */}
      <main className="w-full mx-auto px-4 sm:px-6">
        <div className="mb-10 text-center">
          <h2 className="text-4xl font-black text-slate-900">
            Menu {RESTAURANT_DATA.name}
          </h2>
          <p className="text-slate-500 mt-2 font-medium">
            Choose from our wide selection and enjoy fast delivery
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {menus.map((menu) => (
            <motion.div
              key={menu.id}
              whileHover={{ y: -10 }}
              onClick={() => setSelectedMenu(menu)}
              className="relative aspect-[4/5] rounded-[2.5rem] overflow-hidden cursor-pointer group shadow-2xl"
            >
              <img
                src={menu.image}
                alt={menu.name}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
              <div className="absolute bottom-6 right-6 left-6 text-white">
                <div className="flex items-center gap-3 mb-2">
                  {getMenuIcon(menu.name)}
                  <h3 className="text-2xl font-black truncate">{menu.name}</h3>
                </div>
                <p className="text-orange-300 font-bold flex items-center gap-2 text-sm">
                  Show Category <ArrowRight size={16} />
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      {/* 3. مودال عرض الأصناف */}
      <AnimatePresence>
        {selectedMenu && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-0 z-[60] bg-white/80 overflow-y-auto"
          >
            <div className="p-6 border-b flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur-md z-10">
              <Button
                variant="ghost"
                onClick={() => setSelectedMenu(null)}
                className="rounded-full bg-slate-100"
              >
                <X />
              </Button>
              <h3 className="font-black text-xl">{selectedMenu.name}</h3>
              <div className="w-10" />
            </div>
            <div className="p-6 max-w-4xl mx-auto space-y-12">
              {selectedMenu.categories?.map((cat) => (
                <div key={cat.id}>
                  <h4 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800 border-b pb-3">
                    <span className="bg-orange-100 text-orange-600 p-2 rounded-xl">
                      {getMenuIcon(selectedMenu.name)}
                    </span>
                    {cat.name}
                  </h4>
                  <div className="grid gap-4">
                    {cat.items?.map((item) => (
                      <motion.div
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedItem(item);

                          setSelectedOptions({
                            dough: null,
                            sauce: null,
                            extra: [],
                            filling: null,
                          });
                        }}
                        className="bg-white p-4 rounded-3xl flex gap-4 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer"
                      >
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-24 h-24 rounded-2xl object-cover shadow-inner"
                        />
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <h5 className="font-black text-base text-slate-900">
                              {item.name}
                            </h5>
                            <div className="text-right">
                              {item.options_grouped?.size ? (
                                <div className="flex flex-col items-end">
                                  <span className="text-orange-600 font-black text-sm">
                                    ${item.price}
                                  </span>
                                  <span className="text-xs text-slate-400">
                                    Select the size for the final price
                                  </span>
                                </div>
                              ) : (
                                <span className="text-orange-600 font-black">
                                  ${item.price}
                                </span>
                              )}
                            </div>
                          </div>
                          {item.description && (
                            <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                              {item.description}
                            </p>
                          )}
                          <div className="mt-3 flex justify-between items-center">
                            <div className="flex gap-2">
                              {item.options_grouped?.size && (
                                <div className="flex gap-1">
                                  {item.options_grouped.size.map((size) => {
                                    const isSelected =
                                      selectedOptions.size?.id === size.id ||
                                      selectedOptions.size === size.id;
                                    return (
                                      <span
                                        key={size.id}
                                        onClick={() =>
                                          handleOptionSelect("size", size.id)
                                        }
                                        className={`py-1  text-sm rounded-xl border-2 text-center ${
                                          isSelected
                                            ? "border-orange-500 bg-orange-50 text-orange-600"
                                            : "border-slate-100 text-slate-700"
                                        }`}
                                      >
                                        {size.name}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                            <div className="bg-orange-50 text-orange-600 px-3 py-1 rounded-full text-xs font-black flex items-center gap-1">
                              <Plus size={12} /> Add
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 4. مودال تأكيد الإضافة المحسن */}
      <AnimatePresence>
        {selectedItem && (
          <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/60 backdrop-blur-sm p-2 sm:p-4">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              className="bg-white w-full max-w-2xl rounded-t-[2rem] sm:rounded-t-[3rem] p-4 sm:p-6 md:p-8 overflow-y-auto max-h-[90vh]"
            >
              <div className="flex justify-between items-start mb-4 sm:mb-6 gap-2">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg sm:text-xl md:text-2xl font-black text-slate-900 truncate">
                    {selectedItem.name}
                  </h3>
                  {selectedItem.description && (
                    <p className="text-slate-500 mt-1 sm:mt-2 text-xs sm:text-sm line-clamp-2">
                      {selectedItem.description}
                    </p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setSelectedItem(null);
                    setSelectedOptions({
                      dough: null,
                      sauce: null,
                      extra: [],
                      filling: null,
                    });
                  }}
                  className="rounded-full bg-slate-100 flex-shrink-0 ml-2"
                >
                  <X size={16} />
                </Button>
              </div>

              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-full h-40 sm:h-48 md:h-56 object-cover rounded-[1.5rem] sm:rounded-[2rem] mb-6 sm:mb-8 shadow-lg"
              />

              {Object.entries(selectedItem.options_grouped).map(
                ([groupKey, options]) => {
                  const config = OPTION_GROUP_CONFIG[groupKey] || {};
                  const isMultiple = config.type === "multiple";

                  return (
                    <div key={groupKey} className="mb-8">
                      <p className="font-bold text-slate-600 mb-3 capitalize">
                        {groupKey.replace("_", " ")}
                        {config.required && (
                          <span className="text-red-500 ml-1">*</span>
                        )}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {options.map((opt) => {
                          const isSelected = isMultiple
                            ? (selectedOptions[groupKey] || []).some(
                                (o) => o.id === opt.id,
                              )
                            : selectedOptions[groupKey]?.id === opt.id;

                          // استخراج الـ position الحالي لهذا الأوبشن
                          const currentPos = isMultiple
                            ? (selectedOptions[groupKey] || []).find(
                                (o) => o.id === opt.id,
                              )?.position
                            : selectedOptions[groupKey]?.id === opt.id
                              ? selectedOptions[groupKey].position
                              : "whole";
                          const s =
                            selectedOptions.size?.name?.toLowerCase() || "";
                          let displayPrice = Number(opt.price || 0);

                          if (groupKey === "topping" || groupKey === "extra") {
                            if (s === "m" || s === "medium")
                              displayPrice += 0.25;
                            else if (s === "l" || s === "large")
                              displayPrice += 0.5;
                            else if (s === "xl") displayPrice += 0.75;
                          }

                          return (
                            <div key={opt.id} className="flex flex-col gap-2">
                              <div
                                onClick={() =>
                                  handleOptionSelect(
                                    groupKey,
                                    opt.id,
                                    "whole",
                                    opt.name,
                                    displayPrice,
                                  )
                                }
                                className={`py-3 px-4 rounded-xl border-2 transition-all cursor-pointer flex justify-between items-center
          ${
            isSelected
              ? "border-orange-500 bg-orange-50"
              : "border-slate-100 bg-white"
          }`}
                              >
                                <div className="text-right">
                                  <div className="font-bold text-slate-900">
                                    {opt.name}
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    +${displayPrice.toFixed(2)}
                                  </div>
                                </div>
                                {isSelected && (
                                  <div className="w-2 h-2 rounded-full bg-orange-500" />
                                )}
                              </div>

                              {/* أزرار التقسيم: تظهر فقط إذا كان الخيار يدعم ذلك وتم اختياره */}
                              {opt.half && isSelected && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-lg"
                                >
                                  {[
                                    { id: "left", label: " Left" },
                                    { id: "whole", label: "Whole" },
                                    { id: "right", label: " Right" },
                                  ].map((pos) => (
                                    <span
                                      key={pos.id}
                                      onClick={() =>
                                        handleOptionSelect(
                                          groupKey,
                                          opt.id,
                                          pos.id,
                                          opt.name,
                                          displayPrice,
                                        )
                                      }
                                      className={`text-[10px] py-1.5 rounded-md font-bold transition-all text-center
                ${
                  currentPos === pos.id
                    ? "bg-white text-orange-600 shadow-sm"
                    : "text-slate-500"
                }`}
                                    >
                                      {pos.label}
                                    </span>
                                  ))}
                                </motion.div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                },
              )}

              {/* عرض السعر الإجمالي */}
              <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-600 text-sm sm:text-base">
                    Total Price:
                  </span>
                  <span className="text-lg sm:text-xl md:text-2xl font-black text-orange-600">
                    ${calculateItemTotal(selectedItem, selectedOptions)}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-500">
                  <p>Base Price: ${selectedItem.price}</p>
                  {selectedOptions.size?.name && (
                    <p>
                      Size ({selectedOptions.size.name}): +$
                      {selectedOptions.size.price || "0.00"}
                    </p>
                  )}
                </div>
              </div>

              {/* زر الإضافة للسلة */}
              <Button
                onClick={() => addToCart(selectedItem, selectedOptions)}
                className="w-full py-4 sm:py-5 md:py-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-black text-base sm:text-lg shadow-lg shadow-orange-200 transition-all"
              >
                {selectedItem.options_grouped?.size &&
                selectedItem.options_grouped.size.length > 0
                  ? `Add ${selectedItem.name} (${
                      selectedOptions.size?.name
                    }) - $${calculateItemTotal(selectedItem, selectedOptions)}`
                  : `Add ${selectedItem.name} - $${calculateItemTotal(
                      selectedItem,
                      selectedOptions,
                    )}`}
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. سلة الطلبات */}
      {/* 5. سلة الطلبات */}
      <AnimatePresence>
        {showCart && (
          <div className="fixed inset-0 z-[80] bg-black/50 backdrop-blur-md flex justify-end">
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              className="w-full max-w-md h-full p-6 shadow-2xl relative flex flex-col bg-white"
            >
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black flex items-center gap-2">
                  <ShoppingCart className="text-orange-500" /> Your Cart
                </h3>
                <Button
                  variant="ghost"
                  onClick={() => setShowCart(false)}
                  className="rounded-full bg-slate-100"
                >
                  <X />
                </Button>
              </div>

              <div className="flex-1 space-y-4 overflow-y-auto">
                {cart.length === 0 ? (
                  <div className="text-center py-20">
                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                      <ShoppingCart size={40} />
                    </div>
                    <p className="text-slate-400 font-bold">
                      Your cart is empty.
                    </p>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 items-center bg-slate-50 p-4 rounded-2xl border border-slate-100"
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-bold text-sm text-slate-800">
                          {item.name}
                        </h4>
                        {item.options && (
                          <div className="text-xs text-slate-500 mt-1 space-y-0.5">
                            {renderCartOptions(item)}
                          </div>
                        )}

                        <p className="text-orange-600 font-bold text-sm mt-1">
                          ${item.price}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center justify-center gap-2 bg-white p-1 rounded-full ">
                          <span
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 text-center justify-center items-center  rounded-full  text-orange-100"
                            onClick={() => updateQty(item.id, -1)}
                          >
                            <Minus className="text-red-800" size={22} />
                          </span>
                          <span className="font-bold text-sm">{item.qty}</span>
                          <span
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 rounded-full text-orange-600"
                            onClick={() => updateQty(item.id, 1)}
                          >
                            <Plus className="text-orange-500" size={22} />
                          </span>
                        </div>
                        <Button
                          variant="ghost"
                          onClick={() => removeFromCart(item.id)}
                          className="text-red-400 h-6 w-6 p-0 hover:bg-red-50 rounded-full"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="mt-6 space-y-4 bg-slate-50 p-5 rounded-2xl">
                  <div className="flex justify-between text-sm text-slate-600 items-center">
                    <span>Phone:</span>
                    <input
                      type="tel"
                      placeholder="Enter your phone number"
                      className="w-32 px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                  <div className="flex justify-between text-lg font-black text-slate-900">
                    <span>Total:</span>
                    <span className="text-orange-600">
                      ${(cartTotal + 5 + cartTotal * 0.095).toFixed(2)}
                    </span>
                    <span>Delivery:</span>
                    <span className="text-orange-600">5.00</span>
                    <span>TAX:</span>
                    <span className="text-orange-600">
                      {(cartTotal * 0.095).toFixed(2)}
                    </span>
                  </div>
                  <Button
                    className="w-full py-6 rounded-full bg-orange-600 hover:bg-orange-700 text-white font-black text-lg shadow-xl shadow-orange-200 transition-all"
                    onClick={() => {
                      if (!canProceedToPayment()) {
                        return;
                      }
                      setShowPaymentModal(true);
                    }}
                  >
                    Proceed to Checkout
                  </Button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* 6. مودال اختيار الموقع */}
      <AnimatePresence>
        {showLocModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-md p-6 shadow-2xl"
            >
              <LocationPicker
                location={location}
                setLocation={setLocation}
                onClose={() => setShowLocModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 7. الزر العائم للسلة */}
      {cart.length > 0 && !showCart && (
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-6 left-4 right-4 z-40 max-w-lg mx-auto"
        >
          <Button
            onClick={() => setShowCart(true)}
            className="w-full py-7 h-16 rounded-full bg-orange-500 hover:bg-orange-600 text-white shadow-[0_15px_40px_rgba(249,115,22,0.4)] flex justify-between px-6 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="bg-white/20 p-1.5 rounded-lg">
                <ShoppingCart size={20} />
              </div>
              <div className="text-left">
                <span className="font-bold text-base">{cart.length} items</span>
                <span className="block text-xs text-orange-100">Show Cart</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
          </Button>
        </motion.div>
      )}

      {/* 8. مودال الدفع Clover */}
      <AnimatePresence>
        {showPaymentModal && (
          <CloverPayment
            cartTotal={cartTotal}
            onPaymentSuccess={(token) => {
              setPaymentToken(token);
              newOrderDelivery(token);
            }}
            onClose={() => setShowPaymentModal(false)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default MenuShowDelivery;
