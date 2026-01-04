"use client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Flame } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useState } from "react";
// 1. استيراد مكون Image من Next.js
import Image from "next/image";

const menuItems = [
  {
    id: 1,
    name: "برجر اللحم الفاخر",
    nameEn: "Premium Beef Burger",
    description: "برجر لحم طازج مع جبن شيدر، خس، طماطم، وصوص خاص",
    descriptionEn:
      "Fresh beef burger with cheddar cheese, lettuce, tomato, and special sauce",
    price: 45,
    image: "/images/berger.jpeg",
    category: "برجر",
    isPopular: true,
  },
  {
    id: 2,
    name: "باستا الفريدو",
    nameEn: "Alfredo Pasta",
    description: "معكرونة كريمية مع الدجاج والفطر وجبن البارميزان",
    descriptionEn: "Creamy pasta with chicken, mushrooms, and parmesan cheese",
    price: 38,
    image: "/images/pasta.jpeg",
    category: "باستا",
  },
  {
    id: 3,
    name: "بيتزا مارغريتا",
    nameEn: "Margherita Pizza",
    description: "بيتزا إيطالية كلاسيكية مع الطماطم والموتزاريلا والريحان",
    descriptionEn: "Classic Italian pizza with tomato, mozzarella, and basil",
    price: 42,
    image: "/images/pizza.jpeg",
    category: "بيتزا",
    isPopular: true,
  },
  {
    id: 4,
    name: "شاورما الدجاج",
    nameEn: "Chicken Shawarma",
    description: "دجاج مشوي مع خضار طازجة وصوص الثوم في خبز طازج",
    descriptionEn:
      "Grilled chicken with fresh vegetables and garlic sauce in soft bread",
    price: 28,
    image: "/images/dgag.jpeg",
    category: "مأكولات شرقية",
    isSpicy: true,
  },
];

const categories = {
  ar: ["الكل", "برجر", "بيتزا", "باستا", "مأكولات شرقية", "مشروبات"],
  en: ["All", "Burgers", "Pizza", "Pasta", "Oriental Dishes", "Drinks"],
};

export default function MenuSection() {
  const { lang } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState("الكل");

  const filteredItems =
    selectedCategory === "الكل"
      ? menuItems
      : menuItems.filter((item) => item.category === selectedCategory);

  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        {/* Section Title */}
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold font-cairo mb-4">
            {lang === "ar" ? "استكشف قائمتنا" : "Explore Our Menu"}
          </h2>
          <p className="text-xl text-muted-foreground font-cairo">
            {lang === "ar"
              ? "أطباق شهية معدة بعناية لتناسب جميع الأذواق"
              : "Delicious dishes carefully crafted for every taste"}
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-3 justify-center mb-12">
          {categories[lang].map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              onClick={() => setSelectedCategory(category)}
              className="font-cairo font-semibold transition-all"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Menu Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map((item, index) => (
            // 2. تمرير ما إذا كان العنصر هو الأول (والأهم لـ LCP)
            <MenuCard
              key={item.id}
              item={item}
              index={index}
              lang={lang}
              isFirstItem={index === 0} // تحديد أول عنصر
            />
          ))}
        </div>

        {filteredItems.length === 0 && (
          <p className="text-center text-muted-foreground mt-8 font-cairo">
            {lang === "ar"
              ? "لا توجد عناصر في هذه الفئة"
              : "No items in this category"}
          </p>
        )}
      </div>
    </section>
  );
}

// 3. تحديث MenuCard لقبول isFirstItem
const MenuCard = ({ item, index, lang, isFirstItem }) => (
  <div
    className="group bg-card border border-border rounded-2xl overflow-hidden shadow-soft hover:shadow-card transition-all duration-300 hover:-translate-y-2 animate-fade-in"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {/* Image */}
    <div className="relative h-48 overflow-hidden">
      {/* 4. استخدام مكون Image مع الأبعاد و خاصية priority */}
      <Image
        src={item.image}
        alt={lang === "ar" ? item.name : item.nameEn}
        width={300} // تم تعيين عرض تقريبي بالبكسل
        height={192} // تم تعيين ارتفاع تقريبي بالبكسل (يتطابق مع h-48 حيث 48 * 4 = 192px)
        priority={isFirstItem} // تحميل الأولوية للعنصر الأول فقط (LCP)
        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
      />
      <div className="absolute top-3 left-3 flex gap-2">
        {item.isPopular && (
          <Badge className="bg-secondary text-secondary-foreground font-cairo font-semibold">
            {lang === "ar" ? "الأكثر طلباً" : "Popular"}
          </Badge>
        )}
        {item.isSpicy && (
          <Badge
            variant="destructive"
            className="font-cairo font-semibold flex items-center"
          >
            <Flame className="h-3 w-3 ml-1" />
            {lang === "ar" ? "حار" : "Spicy"}
          </Badge>
        )}
      </div>
    </div>

    {/* Content */}
    <div className="p-5 space-y-3">
      <div>
        <h3 className="font-bold text-lg font-cairo mb-1">
          {lang === "ar" ? item.name : item.nameEn}
        </h3>
        <p className="text-xs text-muted-foreground">
          {lang === "ar" ? item.nameEn : item.name}
        </p>
      </div>

      <p className="text-sm text-muted-foreground font-cairo line-clamp-2">
        {lang === "ar" ? item.description : item.descriptionEn}
      </p>

      <div className="flex items-center justify-between pt-2">
        <span className="text-2xl font-bold text-primary font-cairo">
          {item.price} {lang === "ar" ? "ج.م" : "EGP"}
        </span>
        <Button
          size="sm"
          className="shadow-button hover:shadow-lg transition-all font-cairo font-semibold"
        >
          <Plus className="h-4 w-4 ml-1" />
          {lang === "ar" ? "إضافة" : "Add"}
        </Button>
      </div>
    </div>
  </div>
);
