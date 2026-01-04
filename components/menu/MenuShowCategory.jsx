"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { getRestaurantWithUser } from "@/lib/restaurantApi";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MapPin, Phone, Flame, X, Globe, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { MenuHeader } from "../layout/MenuHeader";
import AddToOrderButton from "./AddToOrderButton";
import { useCurrency } from "@/context/CurrencyContext";
import {
  FaGoogle,
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaStar,
} from "react-icons/fa";

const MenuShowCategory = ({ table_id, restaurant_id, user_id, token }) => {
  const { lang } = useLanguage();
  const [restaurant, setRestaurant] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState(null);
  const { formatPrice } = useCurrency();
  const isArabic = lang === "ar";
  const t = (ar, en) => (isArabic ? ar : en);

  const socialLinks = [
    {
      icon: <FaGoogle className="w-10 h-10 text-red-600" />,
      field: "google_review",
    },
    {
      icon: <FaFacebook className="w-10 h-10 text-blue-500" />,
      field: "facebook",
    },
    {
      icon: <FaInstagram className="w-10 h-10 text-pink-500" />,
      field: "instagram",
    },
    {
      icon: <FaTiktok className="w-10 h-10" />,
      field: "tiktok",
    },
    {
      icon: <Globe className="w-10 h-10 text-green-400" />,
      field: "website",
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getRestaurantWithUser(restaurant_id, user_id, token);
        if (res?.active === false) {
          toast.error("⚠️ انتهى اشتراك المطعم، يرجى التجديد للاستمرار.");
          return;
        }
        setRestaurant(res);
      } catch (err) {
        console.error(err);
        toast.error(
          t("فشل تحميل بيانات المطعم", "Failed to load restaurant data")
        );
      }
    };
    fetchData();
  }, [restaurant_id, user_id, token]);

  if (!restaurant) return null;

  return (
    <section
      dir={isArabic ? "rtl" : "ltr"}
      className="min-h-screen relative border border-white/10 shadow-2xl"
      style={{
        backgroundImage: `url(${restaurant.cover})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-0"> </div>
      <div className="relative z-10">
        {/* Header */}
        <MenuHeader
          logo={restaurant?.logo}
          restaurant_id={restaurant_id}
          user_id={user_id}
          token={token}
        />

        {/* Auto Scrolling Icons */}
        {restaurant.links && (
          <div className="overflow-hidden w-full py-4  mt-16">
            <motion.div
              className="flex gap-10"
              animate={{ x: ["100%", "-100%"] }}
              transition={{
                repeat: Infinity,
                duration: 27,
                ease: "linear",
              }}
            >
              {[...socialLinks] // نكررهم مرتين للـ loop
                .filter((s) => restaurant.links[s.field])
                .map((item, i) => (
                  <a
                    key={i}
                    href={
                      restaurant.links[item.field].startsWith("http")
                        ? restaurant.links[item.field]
                        : "https://" + restaurant.links[item.field]
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center w-16 h-16  hover:scale-110 transition"
                  >
                    {item.icon}
                  </a>
                ))}
            </motion.div>
          </div>
        )}

        <div className=" flex overflow-hidden w-full  mt-6 justify-center">
          {restaurant.links?.google_review && (
            <GoogleReviewCard link={restaurant.links?.google_review} />
          )}
        </div>

        {/* Menus List */}
        <div className="max-w-6xl mt-28 mx-auto px-4 py-10">
          <h2 className="text-2xl font-bold text-center mb-6 font-cairo">
            {t("القوائم المتاحة", "Available Menus")}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {restaurant.menus.map((menu) => (
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
                    <h3 className="text-2xl font-black truncate">
                      {menu.name}
                    </h3>
                  </div>
                  <p className="text-orange-300 font-bold flex items-center gap-2 text-sm">
                    Show Category <ArrowRight size={16} />
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Modal for selected menu */}
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

              {selectedMenu.categories?.map((cat) => (
                <div key={cat.id}>
                  <h4 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-800 border-b pb-3">
                    <span className="bg-orange-100 text-orange-600 p-2 rounded-xl"></span>
                    {cat.name}
                  </h4>
                  <div className="grid gap-4">
                    {cat.items?.map((item) => (
                      <motion.div
                        key={item.id}
                        whileTap={{ scale: 0.98 }}
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
                            <AddToOrderButton
                              table_id={table_id}
                              setSelectedMenu={setSelectedMenu}
                              item={item}
                              restaurant_id={restaurant_id}
                              lang={lang}
                            />
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default MenuShowCategory;

function GoogleReviewCard({ link }) {
  return (
    <motion.a
      href={link}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.03 }}
      className="
        w-full max-w-sm 
       
        flex flex-col  text-center  justify-center items-center cursor-pointer
         transition
      "
    >
      {/* Google Logo */}
      <div className="p-3 flex justify-center text-center  items-center rounded-full shadow-lg">
        <FaGoogle className="flex text-yellow-500 text-4xl" />
      </div>

      <div className="flex flex-col">
        <h3 className="text-white font-semibold text-lg">Google Reviews</h3>

        <div className="flex items-center gap-1 mt-1">
          {[...Array(6)].map((_, i) => (
            <FaStar key={i} className="text-yellow-400" />
          ))}
        </div>
      </div>
    </motion.a>
  );
}
