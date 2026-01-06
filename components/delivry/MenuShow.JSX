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
import { getMenus } from "@/lib/menuApi";
import { addNewOrderDelivery } from "@/lib/orderApi";

const MenuShowDelivery = () => {
  // --- States ---
  const [cart, setCart] = useState([]);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [activeSize, setActiveSize] = useState("M");
  const [selectedOptions, setSelectedOptions] = useState({
    dough: null,
    sauce: null,
    extra: [],
    filling: null,
  });
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

  useEffect(() => {
    const fetchLocation = async (lat, lng) => {
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=en`,
          {
            headers: {
              "User-Agent": "DeliveryApp/1.0 eeslamawood@gmail.com",
            },
          }
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
        { enableHighAccuracy: true, timeout: 10000 }
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

  // --- دالة لحساب السعر النهائي ---
  const calculateItemTotal = (item, size = null, options = {}) => {
    let total = parseFloat(item.price) || 0;

    // إضافة سعر الحجم
    if (size && item.options_grouped?.size) {
      const sizeOption = item.options_grouped.size.find(
        (s) => s.name === size || s.name_en === size
      );
      if (sizeOption) {
        total += parseFloat(sizeOption.price);
      }
    }

    // إضافة سعر Dough
    if (options.dough && item.options_grouped?.dough) {
      const doughOption = item.options_grouped.dough.find(
        (d) => d.id === options.dough
      );
      if (doughOption) {
        total += parseFloat(doughOption.price);
      }
    }

    // إضافة سعر Sauce
    if (options.sauce && item.options_grouped?.sauce) {
      const sauceOption = item.options_grouped.sauce.find(
        (s) => s.id === options.sauce
      );
      if (sauceOption) {
        total += parseFloat(sauceOption.price);
      }
    }

    // إضافة سعر الحشوات
    if (options.filling && item.options_grouped?.filling) {
      const fillingOption = item.options_grouped.filling.find(
        (f) => f.id === options.filling
      );
      if (fillingOption) {
        total += parseFloat(fillingOption.price);
      }
    }

    // إضافة سعر الإضافات
    if (
      options.extra &&
      options.extra.length > 0 &&
      item.options_grouped?.extra
    ) {
      options.extra.forEach((extraId) => {
        const extraOption = item.options_grouped.extra.find(
          (e) => e.id === extraId
        );
        if (extraOption) {
          total += parseFloat(extraOption.price);
        }
      });
    }

    return total.toFixed(2);
  };

  // --- دالات السلة المحسنة ---// --- دالات السلة المحسنة ---
  const addToCart = (item, size = null, options = {}) => {
    const finalPrice = calculateItemTotal(item, size, options);
    const cartItemId = size ? `${item.id}-${size}` : `${item.id}`;

    // إنشاء اسم العرض مع الخيارات
    let displayName = item.name;
    if (size) displayName += ` (${size})`;

    // جمع معلومات الخيارات مع الـ IDs
    const optionDetails = {
      dough: options.dough
        ? {
            id: options.dough,
            name: item.options_grouped?.dough?.find(
              (d) => d.id === options.dough
            )?.name,
          }
        : null,
      sauce: options.sauce
        ? {
            id: options.sauce,
            name: item.options_grouped?.sauce?.find(
              (s) => s.id === options.sauce
            )?.name,
          }
        : null,
      filling: options.filling
        ? {
            id: options.filling,
            name: item.options_grouped?.filling?.find(
              (f) => f.id === options.filling
            )?.name,
          }
        : null,
      extra:
        options.extra && item.options_grouped?.extra
          ? options.extra
              .map((extraId) => {
                const extraOption = item.options_grouped.extra.find(
                  (e) => e.id === extraId
                );
                return extraOption
                  ? { id: extraOption.id, name: extraOption.name }
                  : null;
              })
              .filter(Boolean)
          : [],
    };

    setCart((prev) => {
      const existing = prev.find((i) => i.id === cartItemId);
      if (existing) {
        return prev.map((i) =>
          i.id === cartItemId ? { ...i, qty: i.qty + 1 } : i
        );
      }
      return [
        ...prev,
        {
          ...item,
          id: cartItemId,
          name: displayName,
          price: parseFloat(finalPrice),
          qty: 1,
          size: size,
          options: optionDetails,
          options_grouped: item.options_grouped, // حفظ للرجوع إليه لاحقاً
        },
      ];
    });
    setSelectedItem(null);
    setSelectedOptions({
      dough: null,
      sauce: null,
      extra: [],
      filling: null,
    });
    toast.success(`Successfully added ${displayName} 🍽️`);
  };
  const updateQty = (id, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? { ...item, qty: Math.max(1, item.qty + delta) }
            : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const newOrderDelivery = async () => {
    if (!location.isSet || !location.address) {
      toast.error("Please set your delivery location first!");
      setShowCart(false);
      setShowLocModal(true);
      return;
    }

    if (!phone) {
      toast.error("Please set your delivery Phone first!");
      setShowCart(false);
      setShowLocModal(true);
      return;
    }

    if (cart.length === 0) {
      toast.error("Your cart is empty!");
      return;
    }

    // تأكد من أن menus موجود ولديه restaurant_id
    if (!menus || menus.length === 0) {
      toast.error("No restaurant data available!");
      return;
    }

    // تحضير بيانات الطلب
    const orderData = {
      restaurant_id: menus[0]?.restaurant_id || 1,
      address: location.address,
      latitude: location.lat,
      longitude: location.lng,
      phone: phone.trim(),
      items: cart.map((item) => {
        // استخراج الـ item_id الحقيقي (إزالة جزء الحجم إذا موجود)
        const itemId = item.id.includes("-") ? item.id.split("-")[0] : item.id;

        // جمع جميع option IDs بشكل صحيح
        const optionIds = [];

        // إضافة option IDs للخيارات المختلفة
        if (item.options?.dough?.id) {
          optionIds.push(item.options.dough.id);
        }

        if (item.options?.sauce?.id) {
          optionIds.push(item.options.sauce.id);
        }

        if (item.options?.filling?.id) {
          optionIds.push(item.options.filling.id);
        }

        // الإضافات تكون مصفوفة من IDs
        if (item.options?.extra && Array.isArray(item.options.extra)) {
          item.options.extra.forEach((extra) => {
            if (extra.id) {
              optionIds.push(extra.id);
            }
          });
        }

        // الحجم يكون option من نوع size
        if (item.size) {
          // إذا كان item يحتوي على options_grouped، نبحث عن ID الحجم
          if (item.options_grouped?.size) {
            const sizeOption = item.options_grouped.size.find(
              (s) => s.name === item.size
            );
            if (sizeOption?.id) {
              optionIds.push(sizeOption.id);
            }
          }
        }

        return {
          item_id: parseInt(itemId),
          quantity: item.qty,
          price: item.price,
          options: optionIds, // مصفوفة من الـ IDs فقط
          comment: item.size ? `Size: ${item.size}` : "",
        };
      }),
      total_price: cartTotal.toFixed(2),
    };

    console.log("Order data to send:", JSON.stringify(orderData, null, 2));

    try {
      await addNewOrderDelivery(orderData);
      setCart([]);
      setShowCart(false);
      toast.success("Order created successfully! 🎉");
    } catch (error) {
      console.error("Order error:", error);
      toast.error("Failed to create delivery order. Please try again.");
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleOptionSelect = (type, id) => {
    setSelectedOptions((prev) => {
      if (type === "extra") {
        const isSelected = prev.extra.includes(id);
        return {
          ...prev,
          extra: isSelected
            ? prev.extra.filter((item) => item !== id)
            : [...prev.extra, id],
        };
      }
      return {
        ...prev,
        [type]: prev[type] === id ? null : id,
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
      setActiveSize(selectedItem.options_grouped.size[0]?.name || "M");
    }
  }, [selectedItem]);

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
                          setActiveSize(
                            item.options_grouped?.size?.[0]?.name || "M"
                          );
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
                                  {item.options_grouped.size.map((size) => (
                                    <span
                                      key={size.id}
                                      className="text-xs px-2 py-1 bg-slate-100 rounded-full text-slate-600"
                                    >
                                      {size.name}
                                    </span>
                                  ))}
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

              {/* اختيار الحجم */}
              {selectedItem.options_grouped?.size &&
                selectedItem.options_grouped.size.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <p className="font-bold text-slate-600 mb-3 sm:mb-4 text-xs sm:text-sm">
                      Select The Size:
                    </p>
                    <div className="grid grid-cols-4 gap-2 sm:gap-3">
                      {selectedItem.options_grouped.size.map((sizeOption) => (
                        <span
                          key={sizeOption.id}
                          onClick={() => setActiveSize(sizeOption.name)}
                          className={`py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 transition-all flex flex-col items-center ${
                            activeSize === sizeOption.name
                              ? "border-orange-500 bg-orange-50 text-orange-600"
                              : "border-slate-100 text-slate-700"
                          }`}
                        >
                          <span className="font-black text-sm sm:text-lg">
                            {sizeOption.name}
                          </span>
                          <span className="text-xs sm:text-sm font-bold">
                            ${sizeOption.price}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* اختيار Dough */}
              {selectedItem.options_grouped?.dough &&
                selectedItem.options_grouped.dough.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <p className="font-bold text-slate-600 mb-3 sm:mb-4 text-xs sm:text-sm">
                      Select The Dough:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {selectedItem.options_grouped.dough.map((doughOption) => (
                        <span
                          key={doughOption.id}
                          onClick={() =>
                            handleOptionSelect("dough", doughOption.id)
                          }
                          className={`py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all flex flex-col items-center ${
                            selectedOptions.dough === doughOption.id
                              ? "border-orange-500 bg-orange-50 text-orange-600"
                              : "border-slate-100 text-slate-700"
                          }`}
                        >
                          <span className="font-bold text-sm sm:text-base truncate w-full text-center px-1">
                            {doughOption.name}
                          </span>
                          <span className="text-xs sm:text-sm">
                            +${doughOption.price}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* اختيار Sauce */}
              {selectedItem.options_grouped?.sauce &&
                selectedItem.options_grouped.sauce.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <p className="font-bold text-slate-600 mb-3 sm:mb-4 text-xs sm:text-sm">
                      Select The Sauce:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {selectedItem.options_grouped.sauce.map((sauceOption) => (
                        <span
                          key={sauceOption.id}
                          onClick={() =>
                            handleOptionSelect("sauce", sauceOption.id)
                          }
                          className={`py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all flex flex-col items-center ${
                            selectedOptions.sauce === sauceOption.id
                              ? "border-orange-500 bg-orange-50 text-orange-600"
                              : "border-slate-100 text-slate-700"
                          }`}
                        >
                          <span className="font-bold text-sm sm:text-base truncate w-full text-center px-1">
                            {sauceOption.name}
                          </span>
                          <span className="text-xs sm:text-sm">
                            +${sauceOption.price}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* اختيار Filling */}
              {selectedItem.options_grouped?.filling &&
                selectedItem.options_grouped.filling.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <p className="font-bold text-slate-600 mb-3 sm:mb-4 text-xs sm:text-sm">
                      Select The Filling:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {selectedItem.options_grouped.filling.map(
                        (fillingOption) => (
                          <span
                            key={fillingOption.id}
                            onClick={() =>
                              handleOptionSelect("filling", fillingOption.id)
                            }
                            className={`py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all flex flex-col items-center ${
                              selectedOptions.filling === fillingOption.id
                                ? "border-orange-500 bg-orange-50 text-orange-600"
                                : "border-slate-100 text-slate-700"
                            }`}
                          >
                            <span className="font-bold text-sm sm:text-base truncate w-full text-center px-1">
                              {fillingOption.name}
                            </span>
                            <span className="text-xs sm:text-sm">
                              +${fillingOption.price}
                            </span>
                          </span>
                        )
                      )}
                    </div>
                  </div>
                )}

              {/* اختيار الإضافات */}
              {selectedItem.options_grouped?.extra &&
                selectedItem.options_grouped.extra.length > 0 && (
                  <div className="mb-6 sm:mb-8">
                    <p className="font-bold text-slate-600 mb-3 sm:mb-4 text-xs sm:text-sm">
                      Select Extras:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      {selectedItem.options_grouped.extra.map((extraOption) => (
                        <span
                          key={extraOption.id}
                          onClick={() =>
                            handleOptionSelect("extra", extraOption.id)
                          }
                          className={`py-2 sm:py-3 rounded-lg sm:rounded-xl border-2 transition-all flex flex-col items-center ${
                            selectedOptions.extra.includes(extraOption.id)
                              ? "border-orange-500 bg-orange-50 text-orange-600"
                              : "border-slate-100 text-slate-700"
                          }`}
                        >
                          <span className="font-bold text-sm sm:text-base truncate w-full text-center px-1">
                            {extraOption.name}
                          </span>
                          <span className="text-xs sm:text-sm">
                            +${extraOption.price}
                          </span>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

              {/* عرض السعر الإجمالي */}
              <div className="mb-6 sm:mb-8 p-3 sm:p-4 bg-slate-50 rounded-xl sm:rounded-2xl">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold text-slate-600 text-sm sm:text-base">
                    Total Price:
                  </span>
                  <span className="text-lg sm:text-xl md:text-2xl font-black text-orange-600">
                    $
                    {calculateItemTotal(
                      selectedItem,
                      activeSize,
                      selectedOptions
                    )}
                  </span>
                </div>
                <div className="text-xs sm:text-sm text-slate-500">
                  <p>Base Price: ${selectedItem.price}</p>
                  {selectedItem.options_grouped?.size && (
                    <p>
                      Size ({activeSize}): +$
                      {selectedItem.options_grouped.size.find(
                        (s) => s.name === activeSize
                      )?.price || "0.00"}
                    </p>
                  )}
                </div>
              </div>

              {/* زر الإضافة للسلة */}
              <Button
                onClick={() =>
                  addToCart(selectedItem, activeSize, selectedOptions)
                }
                className="w-full py-4 sm:py-5 md:py-6 rounded-full bg-orange-500 hover:bg-orange-600 text-white font-black text-base sm:text-lg shadow-lg shadow-orange-200 transition-all"
              >
                {selectedItem.options_grouped?.size &&
                selectedItem.options_grouped.size.length > 0
                  ? `Add ${
                      selectedItem.name
                    } (${activeSize}) - $${calculateItemTotal(
                      selectedItem,
                      activeSize,
                      selectedOptions
                    )}`
                  : `Add ${selectedItem.name} - $${calculateItemTotal(
                      selectedItem,
                      null,
                      selectedOptions
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
                          <div className="text-xs text-slate-500 mt-1">
                            {item.options.dough &&
                              typeof item.options.dough === "object" && (
                                <p>Dough: {item.options.dough.name}</p>
                              )}
                            {item.options.sauce &&
                              typeof item.options.sauce === "object" && (
                                <p>Sauce: {item.options.sauce.name}</p>
                              )}
                            {item.options.filling &&
                              typeof item.options.filling === "object" && (
                                <p>Filling: {item.options.filling.name}</p>
                              )}
                            {item.options.extra &&
                              Array.isArray(item.options.extra) &&
                              item.options.extra.length > 0 && (
                                <p>
                                  Extra:{" "}
                                  {item.options.extra
                                    .map((e) =>
                                      typeof e === "object" ? e.name : String(e)
                                    )
                                    .join(", ")}
                                </p>
                              )}
                          </div>
                        )}
                        <p className="text-orange-600 font-bold text-sm mt-1">
                          ${item.price}
                        </p>
                      </div>
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-2 bg-white p-1 rounded-full border">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 rounded-full text-orange-600"
                            onClick={() => updateQty(item.id, -1)}
                          >
                            <Minus size={12} />
                          </Button>
                          <span className="font-bold text-sm">{item.qty}</span>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-6 w-6 rounded-full text-orange-600"
                            onClick={() => updateQty(item.id, 1)}
                          >
                            <Plus size={12} />
                          </Button>
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
                      ${cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <Button
                    className="w-full py-6 rounded-full bg-slate-900 hover:bg-black text-white font-black text-lg shadow-xl transition-all"
                    onClick={() => {
                      newOrderDelivery();
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
    </section>
  );
};

export default MenuShowDelivery;
