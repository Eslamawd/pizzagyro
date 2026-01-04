"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart, X } from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import { toast } from "sonner";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/textarea";

export default function AddToOrderButton({
  item,
  lang,
  restaurant_id,
  setSelectedMenu,
  table_id,
}) {
  const { addToOrder, setRestaurantId, setTableId } = useOrder();
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({
    dough: null,
    sauce: null,
    extra: [],
    filling: null,
    size: null,
  });
  const [comment, setComment] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeSize, setActiveSize] = useState("M");

  // عند فتح الدايلوج، نضبط الحجم الافتراضي
  useEffect(() => {
    if (item.options_grouped?.size && item.options_grouped.size.length > 0) {
      setActiveSize(item.options_grouped.size[0]?.name || "M");
      setSelectedOptions((prev) => ({
        ...prev,
        size: item.options_grouped.size[0]?.name || "M",
      }));
    }
  }, [item, open]);

  // ✅ دالة لحساب السعر النهائي
  const calculateItemTotal = () => {
    let total = parseFloat(item.price) || 0;

    // إضافة سعر الحجم
    if (selectedOptions.size && item.options_grouped?.size) {
      const sizeOption = item.options_grouped.size.find(
        (s) => s.name === selectedOptions.size
      );
      if (sizeOption) {
        total += parseFloat(sizeOption.price);
      }
    }

    // إضافة سعر Dough
    if (selectedOptions.dough && item.options_grouped?.dough) {
      const doughOption = item.options_grouped.dough.find(
        (d) => d.id === selectedOptions.dough
      );
      if (doughOption) {
        total += parseFloat(doughOption.price);
      }
    }

    // إضافة سعر Sauce
    if (selectedOptions.sauce && item.options_grouped?.sauce) {
      const sauceOption = item.options_grouped.sauce.find(
        (s) => s.id === selectedOptions.sauce
      );
      if (sauceOption) {
        total += parseFloat(sauceOption.price);
      }
    }

    // إضافة سعر الحشوات
    if (selectedOptions.filling && item.options_grouped?.filling) {
      const fillingOption = item.options_grouped.filling.find(
        (f) => f.id === selectedOptions.filling
      );
      if (fillingOption) {
        total += parseFloat(fillingOption.price);
      }
    }

    // إضافة سعر الإضافات
    if (
      selectedOptions.extra &&
      selectedOptions.extra.length > 0 &&
      item.options_grouped?.extra
    ) {
      selectedOptions.extra.forEach((extraId) => {
        const extraOption = item.options_grouped.extra.find(
          (e) => e.id === extraId
        );
        if (extraOption) {
          total += parseFloat(extraOption.price);
        }
      });
    }

    return total * quantity;
  };

  // ✅ تحديث تلقائي للسعر الإجمالي
  const totalPrice = useMemo(() => {
    return calculateItemTotal();
  }, [selectedOptions, item.price, quantity]);

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

  const handleAdd = () => {
    setRestaurantId(restaurant_id);
    setTableId(table_id);

    // تحضير بيانات الخيارات للإرسال
    const optionsArray = [];

    // إضافة الحجم
    if (selectedOptions.size) {
      const sizeOption = item.options_grouped?.size?.find(
        (s) => s.name === selectedOptions.size
      );
      if (sizeOption) {
        optionsArray.push({
          id: sizeOption.id,
          name: lang === "ar" ? sizeOption.name : sizeOption.name_en,
          name_en: sizeOption.name_en,
          price: parseFloat(sizeOption.price),
          option_type: "size",
        });
      }
    }

    // إضافة العجين
    if (selectedOptions.dough && item.options_grouped?.dough) {
      const doughOption = item.options_grouped.dough.find(
        (d) => d.id === selectedOptions.dough
      );
      if (doughOption) {
        optionsArray.push({
          id: doughOption.id,
          name: lang === "ar" ? doughOption.name : doughOption.name_en,
          name_en: doughOption.name_en,
          price: parseFloat(doughOption.price),
          option_type: "dough",
        });
      }
    }

    // إضافة الصلصة
    if (selectedOptions.sauce && item.options_grouped?.sauce) {
      const sauceOption = item.options_grouped.sauce.find(
        (s) => s.id === selectedOptions.sauce
      );
      if (sauceOption) {
        optionsArray.push({
          id: sauceOption.id,
          name: lang === "ar" ? sauceOption.name : sauceOption.name_en,
          name_en: sauceOption.name_en,
          price: parseFloat(sauceOption.price),
          option_type: "sauce",
        });
      }
    }

    // إضافة الحشوة
    if (selectedOptions.filling && item.options_grouped?.filling) {
      const fillingOption = item.options_grouped.filling.find(
        (f) => f.id === selectedOptions.filling
      );
      if (fillingOption) {
        optionsArray.push({
          id: fillingOption.id,
          name: lang === "ar" ? fillingOption.name : fillingOption.name_en,
          name_en: fillingOption.name_en,
          price: parseFloat(fillingOption.price),
          option_type: "filling",
        });
      }
    }

    // إضافة الإضافات
    if (selectedOptions.extra && item.options_grouped?.extra) {
      selectedOptions.extra.forEach((extraId) => {
        const extraOption = item.options_grouped.extra.find(
          (e) => e.id === extraId
        );
        if (extraOption) {
          optionsArray.push({
            id: extraOption.id,
            name: lang === "ar" ? extraOption.name : extraOption.name_en,
            name_en: extraOption.name_en,
            price: parseFloat(extraOption.price),
            option_type: "extra",
          });
        }
      });
    }

    addToOrder(
      {
        id: item.id,
        name: lang === "ar" ? item.name : item.name_en,
        comment: comment,
        price: parseFloat(item.price),
        image: item.image,
        options_grouped: item.options_grouped, // حفظ options_grouped للعرض
      },
      quantity,
      optionsArray
    );

    toast.success(
      `${lang === "ar" ? "تمت إضافة" : "Added"} ${
        lang === "ar" ? item.name : item.name_en
      } (${quantity}x)`
    );

    setOpen(false);
    setSelectedOptions({
      dough: null,
      sauce: null,
      extra: [],
      filling: null,
      size: null,
    });
    setQuantity(1);
    setComment("");
    setSelectedMenu?.(null);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="sm"
          className="shadow-button hover:shadow-lg transition-all font-cairo font-semibold bg-black text-white"
        >
          <Plus className="h-4 w-4 ml-1" />
          {lang === "ar" ? "إضافة" : "Add"}
        </Button>
      </DialogTrigger>

      <DialogContent className="font-cairo bg-white max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {lang === "ar" ? item.name : item.name_en}
            {item.description && (
              <p className="text-sm text-gray-500 mt-1">
                {lang === "ar" ? item.description : item.description_en}
              </p>
            )}
          </DialogTitle>
        </DialogHeader>

        <img
          src={item.image}
          alt={lang === "ar" ? item.name : item.name_en}
          className="w-full h-48 object-cover rounded-lg mb-4"
        />

        {/* اختيار الحجم */}
        {item.options_grouped?.size && item.options_grouped.size.length > 0 && (
          <div className="mb-6">
            <p className="font-bold text-slate-600 mb-3 text-sm">
              {lang === "ar" ? "اختر الحجم:" : "Select The Size:"}
            </p>
            <div className="grid grid-cols-4 gap-2">
              {item.options_grouped.size.map((sizeOption) => (
                <span
                  key={sizeOption.id}
                  onClick={() => {
                    setActiveSize(sizeOption.name);
                    setSelectedOptions((prev) => ({
                      ...prev,
                      size: sizeOption.name,
                    }));
                  }}
                  className={`py-2 rounded-lg border-2 transition-all flex flex-col items-center ${
                    activeSize === sizeOption.name
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-slate-100 text-slate-700"
                  }`}
                >
                  <span className="font-bold text-sm">{sizeOption.name}</span>
                  <span className="text-xs">
                    +{parseFloat(sizeOption.price)} {lang === "ar" ? "$" : "$"}
                  </span>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* اختيار Dough */}
        {item.options_grouped?.dough &&
          item.options_grouped.dough.length > 0 && (
            <div className="mb-6">
              <p className="font-bold text-slate-600 mb-3 text-sm">
                {lang === "ar" ? "اختر نوع العجين:" : "Select The Dough:"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {item.options_grouped.dough.map((doughOption) => (
                  <span
                    key={doughOption.id}
                    onClick={() => handleOptionSelect("dough", doughOption.id)}
                    className={`py-2 rounded-lg border-2 transition-all flex flex-col items-center ${
                      selectedOptions.dough === doughOption.id
                        ? "border-orange-500 bg-orange-50 text-orange-600"
                        : "border-slate-100 text-slate-700"
                    }`}
                  >
                    <span className="font-bold text-sm truncate w-full text-center px-1">
                      {lang === "ar" ? doughOption.name : doughOption.name_en}
                    </span>
                    <span className="text-xs">
                      +{parseFloat(doughOption.price)}{" "}
                      {lang === "ar" ? "$" : "$"}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* اختيار Sauce */}
        {item.options_grouped?.sauce &&
          item.options_grouped.sauce.length > 0 && (
            <div className="mb-6">
              <p className="font-bold text-slate-600 mb-3 text-sm">
                {lang === "ar" ? "اختر الصلصة:" : "Select The Sauce:"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {item.options_grouped.sauce.map((sauceOption) => (
                  <span
                    key={sauceOption.id}
                    onClick={() => handleOptionSelect("sauce", sauceOption.id)}
                    className={`py-2 rounded-lg border-2 transition-all flex flex-col items-center ${
                      selectedOptions.sauce === sauceOption.id
                        ? "border-orange-500 bg-orange-50 text-orange-600"
                        : "border-slate-100 text-slate-700"
                    }`}
                  >
                    <span className="font-bold text-sm truncate w-full text-center px-1">
                      {lang === "ar" ? sauceOption.name : sauceOption.name_en}
                    </span>
                    <span className="text-xs">
                      +{parseFloat(sauceOption.price)}{" "}
                      {lang === "ar" ? "$" : "$"}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* اختيار Filling */}
        {item.options_grouped?.filling &&
          item.options_grouped.filling.length > 0 && (
            <div className="mb-6">
              <p className="font-bold text-slate-600 mb-3 text-sm">
                {lang === "ar" ? "اختر الحشوة:" : "Select The Filling:"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {item.options_grouped.filling.map((fillingOption) => (
                  <span
                    key={fillingOption.id}
                    onClick={() =>
                      handleOptionSelect("filling", fillingOption.id)
                    }
                    className={`py-2 rounded-lg border-2 transition-all flex flex-col items-center ${
                      selectedOptions.filling === fillingOption.id
                        ? "border-orange-500 bg-orange-50 text-orange-600"
                        : "border-slate-100 text-slate-700"
                    }`}
                  >
                    <span className="font-bold text-sm truncate w-full text-center px-1">
                      {lang === "ar"
                        ? fillingOption.name
                        : fillingOption.name_en}
                    </span>
                    <span className="text-xs">
                      +{parseFloat(fillingOption.price)}{" "}
                      {lang === "ar" ? "$" : "$"}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* اختيار الإضافات */}
        {item.options_grouped?.extra &&
          item.options_grouped.extra.length > 0 && (
            <div className="mb-6">
              <p className="font-bold text-slate-600 mb-3 text-sm">
                {lang === "ar" ? "اختر الإضافات:" : "Select Extras:"}
              </p>
              <div className="grid grid-cols-2 gap-2">
                {item.options_grouped.extra.map((extraOption) => (
                  <span
                    key={extraOption.id}
                    onClick={() => handleOptionSelect("extra", extraOption.id)}
                    className={`py-2 rounded-lg border-2 transition-all flex flex-col items-center ${
                      selectedOptions.extra.includes(extraOption.id)
                        ? "border-orange-500 bg-orange-50 text-orange-600"
                        : "border-slate-100 text-slate-700"
                    }`}
                  >
                    <span className="font-bold text-sm truncate w-full text-center px-1">
                      {lang === "ar" ? extraOption.name : extraOption.name_en}
                    </span>
                    <span className="text-xs">
                      +{parseFloat(extraOption.price)}{" "}
                      {lang === "ar" ? "$" : "$"}
                    </span>
                  </span>
                ))}
              </div>
            </div>
          )}

        {/* ✅ الكمية */}
        <div className="mb-6">
          <p className="font-bold text-slate-600 mb-3 text-sm">
            {lang === "ar" ? "الكمية:" : "Quantity:"}
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button
              size="icon"
              variant="outline"
              onClick={() => setQuantity((prev) => (prev > 1 ? prev - 1 : 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="text-lg font-bold">{quantity}</span>
            <Button
              size="icon"
              variant="outline"
              onClick={() => setQuantity((prev) => prev + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ✅ التعليق */}
        <div className="mb-6">
          <Label>{lang === "ar" ? "تعليق:" : "Comment:"}</Label>
          <Textarea
            placeholder={
              lang === "ar" ? "أضف تعليقك هنا..." : "Add your comment here..."
            }
            className="w-full mt-1"
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
        </div>

        {/* ✅ السعر الإجمالي */}
        <div className="mb-6 p-4 bg-slate-50 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="font-bold text-slate-600">
              {lang === "ar" ? "السعر الإجمالي:" : "Total Price:"}
            </span>
            <span className="text-xl font-black text-orange-600">
              {totalPrice.toFixed(2)} {lang === "ar" ? "جنيه" : "$"}
            </span>
          </div>
          <div className="text-sm text-slate-500">
            <p>
              {lang === "ar" ? "السعر الأساسي:" : "Base Price:"}{" "}
              {parseFloat(item.price).toFixed(2)} {lang === "ar" ? "جنيه" : "$"}
            </p>
            {selectedOptions.size && (
              <p>
                {lang === "ar" ? "الحجم" : "Size"} ({selectedOptions.size}): +
                {item.options_grouped?.size?.find(
                  (s) => s.name === selectedOptions.size
                )?.price || "0.00"}
                {lang === "ar" ? "جنيه" : "$"}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAdd}
            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-cairo mt-4 flex items-center justify-center gap-2 py-4"
          >
            <ShoppingCart className="h-4 w-4" />
            {lang === "ar" ? "تأكيد الإضافة" : "Add to Order"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
