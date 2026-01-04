"use client";

import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/Card";
import { Building2, Briefcase, Users, Loader2 } from "lucide-react";
import { loadAllData } from "@/lib/restaurantApi";

const COLORS = ["#00FFFF", "#00BFFF", "#FF00FF", "#8A2BE2", "#39FF14"];

export default function DashboardPage() {
  const { lang } = useLanguage();
  const { formatPrice } = useCurrency();

  const [restaurantsCount, setRestaurantsCount] = useState(0);
  const [ordersCount, setOrdersCount] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [ordersByRestaurant, setOrdersByRestaurant] = useState([]);
  const [monthlyRevenue, setMonthlyRevenue] = useState([]);
  const [topRestaurants, setTopRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await loadAllData();
      const {
        restaurants_count,
        orders_count,
        total_revenue,
        orders_by_restaurant,
        monthly_revenue,
        top_restaurants,
      } = res;

      setRestaurantsCount(restaurants_count);
      setOrdersCount(orders_count);
      setTotalRevenue(total_revenue);
      setOrdersByRestaurant(orders_by_restaurant);
      setMonthlyRevenue(monthly_revenue);
      setTopRestaurants(top_restaurants);
    } catch (err) {
      console.error("Error loading dashboard data:", err);
      toast.error(
        lang === "ar"
          ? "فشل في تحميل البيانات"
          : "Failed to load dashboard data"
      );
    } finally {
      setLoading(false);
    }
  }, [lang]); // أضف lang هنا إذا كانت الدالة تعتمد عليها

  useEffect(() => {
    fetchData();
  }, [fetchData]);
  const cards = [
    {
      id: 1,
      title: lang === "ar" ? "عدد المطاعم" : "Restaurants",
      icon: <Building2 className="h-5 w-5 text-cyan-900" />,
      value: restaurantsCount,
      desc:
        lang === "ar"
          ? "إجمالي عدد المطاعم المسجلة"
          : "Total registered restaurants",
      gradient: "from-cyan-900/20 to-blue-900/10",
    },
    {
      id: 2,
      title: lang === "ar" ? "عدد الطلبات" : "Orders",
      icon: <Briefcase className="h-5 w-5 text-fuchsia-900" />,
      value: ordersCount,
      desc: lang === "ar" ? "إجمالي عدد الطلبات" : "Total completed orders",
      gradient: "from-fuchsia-900/20 to-pink-900/10",
    },
    {
      id: 3,
      title: lang === "ar" ? "إجمالي الإيرادات" : "Total Revenue",
      icon: <Users className="h-5 w-5 text-emerald-500" />,
      value: formatPrice(totalRevenue),
      desc:
        lang === "ar"
          ? "إجمالي المبيعات من الطلبات"
          : "Total revenue from orders",
      gradient: "from-emerald-500/20 to-cyan-500/10",
    },
  ];

  return (
    <motion.div
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="min-h-screen  p-6 text-white"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
    >
      {/* 🌟 Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-400 bg-clip-text text-transparent">
          {lang === "ar" ? "لوحة التحكم" : "Dashboard Overview"}
        </h1>
        <p className="text-sm text-gray-400 mt-2">
          {lang === "ar"
            ? "إحصائيات عامة لمطاعمك وطلباتك"
            : "Overview of your restaurants and orders"}
        </p>
      </div>

      {/* 📦 Cards Section */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial="hidden"
        animate="show"
      >
        {loading ? (
          <div className="col-span-3 flex justify-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-900" />
          </div>
        ) : (
          cards.map((card) => (
            <motion.div
              key={card.id}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <div
                className={`p-6 rounded-2xl bg-gradient-to-br ${card.gradient} backdrop-blur-lg border border-white/10 shadow-lg`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {card.icon}
                    <span className="text-lg font-semibold">{card.title}</span>
                  </div>
                </div>
                <div className="mt-4 text-4xl font-bold text-white">
                  {card.value}
                </div>
                <p className="text-sm text-gray-400 mt-2">{card.desc}</p>
              </div>
            </motion.div>
          ))
        )}
      </motion.div>

      {/* 📊 Charts Section */}
      {!loading && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mt-10">
          {/* Bar Chart */}
          <ChartCard
            title={lang === "ar" ? "الطلبات لكل مطعم" : "Orders per Restaurant"}
          >
            <BarChart data={ordersByRestaurant}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,23,42,0.9)",
                  color: "#fff",
                  border: "1px solid #334155",
                }}
              />
              <Bar dataKey="orders" fill="#00FFFF" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ChartCard>

          {/* Line Chart */}
          <ChartCard
            title={lang === "ar" ? "الإيرادات الشهرية" : "Monthly Revenue"}
          >
            <LineChart data={monthlyRevenue}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="month" stroke="#94a3b8" />
              <YAxis stroke="#94a3b8" />
              <Tooltip
                contentStyle={{
                  background: "rgba(15,23,42,0.9)",
                  color: "#fff",
                  border: "1px solid #334155",
                }}
              />
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="#39FF14"
                strokeWidth={3}
                dot={{ r: 5, fill: "#00FFFF" }}
              />
            </LineChart>
          </ChartCard>

          {/* Pie Chart */}
          <ChartCard
            title={
              lang === "ar"
                ? "أفضل 5 مطاعم حسب الإيرادات"
                : "Top 5 Restaurants by Revenue"
            }
          >
            <PieChart>
              <Pie
                data={topRestaurants}
                dataKey="revenue"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={90}
                label
              >
                {topRestaurants.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "rgba(15,23,42,0.9)",
                  color: "#fff",
                  border: "1px solid #334155",
                }}
              />
            </PieChart>
          </ChartCard>
        </div>
      )}
    </motion.div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-gray-800/60 to-gray-900/40 backdrop-blur-lg border border-white/10 shadow-lg">
      <h2 className="text-lg font-semibold text-cyan-300 mb-4">{title}</h2>
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
