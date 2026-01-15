"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";

import { motion } from "framer-motion";
import { useState, useMemo, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart, X } from "lucide-react";
import { useOrder } from "@/context/OrderContext";
import { toast } from "sonner";
import { Label } from "../ui/Label";
import { Textarea } from "../ui/textarea";

const OPTION_GROUP_CONFIG = {
  size: { type: "single", required: true },
  dough: { type: "single", required: false },
  sauce: { type: "single", required: false },
  filling: { type: "single", required: false },
  spice_level: { type: "single", required: false },

  topping: { type: "multiple", required: false },
  extra: { type: "multiple", required: false, max: 5 },
};

export default function AddToOrderButton({
  item,
  lang,
  restaurant_id,
  setSelectedMenu,
  table_id,
}) {
  const { addToOrder, setRestaurantId, setTableId } = useOrder();
  const [open, setOpen] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [comment, setComment] = useState("");
  const [quantity, setQuantity] = useState(1);

  // عند فتح الدايلوج، نضبط الحجم الافتراضي
  useEffect(() => {
    if (item && item.options_grouped?.size && open) {
      // نضع الـ id مباشرة كما في منطق handleOptionSelect للخيارات المفردة
      setSelectedOptions({
        size: { id: item.options_grouped.size[0].id, position: "whole" },
      });
    }
  }, [item, open]);
  // ✅ دالة لحساب السعر النهائي
  const calculateItemTotal = () => {
    let total = Number(item.price);

    Object.entries(selectedOptions).forEach(([groupKey, value]) => {
      const options = item.options_grouped?.[groupKey] || [];

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

      if (Array.isArray(value)) {
        value.forEach((selected) => {
          const opt = options.find((o) => o.id === selected.id);
          if (opt) total += getToppingPrice(opt.price);
        });
      } else {
        const opt = options.find((o) => o.id === value.id);
        if (opt) total += getToppingPrice(opt.price);
      }
    });

    return Number((total * quantity).toFixed(2));
  };

  // ✅ تحديث تلقائي للسعر الإجمالي
  const totalPrice = useMemo(() => {
    return calculateItemTotal();
  }, [selectedOptions, item.price, quantity]);

  // داخل دالة handleOptionSelect، نحتاج لتعديل تخزين الخيارات المتعددة ليشمل الـ position
  const handleOptionSelect = (
    groupKey,
    optionId,
    position = "whole",
    name,
    price
  ) => {
    const config = OPTION_GROUP_CONFIG[groupKey] || { type: "single" };

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

  const handleAdd = () => {
    setRestaurantId(restaurant_id);
    setTableId(table_id);

    // تحضير بيانات الخيارات للإرسال

    const optionsArray = [];

    Object.entries(selectedOptions).forEach(([groupKey, value]) => {
      const options = item.options_grouped?.[groupKey] || [];

      if (Array.isArray(value)) {
        value.forEach((selected) => {
          const opt = options.find((o) => o.id === selected.id);
          if (opt) {
            optionsArray.push({
              id: opt.id,
              position: selected.position || "whole",
              name_en: opt.name_en,
              name: opt.name,
              price: opt.price,
              option_type: opt.option_type, // إرسال الـ position
            });
          }
        });
      } else {
        const opt = options.find((o) => o.id === value);
        if (opt)
          optionsArray.push({
            id: opt.id,
            name_en: opt.name_en,
            name: opt.name,
            price: opt.price,
            option_type: opt.option_type,
          });
      }
    });

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
    setSelectedOptions({});
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

        {Object.entries(item.options_grouped).map(([groupKey, options]) => {
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
                        (o) => o.id === opt.id
                      )
                    : selectedOptions[groupKey]?.id === opt.id;

                  // استخراج الـ position الحالي لهذا الأوبشن
                  const currentPos = isMultiple
                    ? (selectedOptions[groupKey] || []).find(
                        (o) => o.id === opt.id
                      )?.position
                    : selectedOptions[groupKey]?.id === opt.id
                    ? selectedOptions[groupKey].position
                    : "whole";

                  return (
                    <div key={opt.id} className="flex flex-col gap-2">
                      <div
                        onClick={() =>
                          handleOptionSelect(
                            groupKey,
                            opt.id,
                            "whole",
                            opt.name,
                            opt.price
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
                            +${opt.price}
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
                                  opt.price
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
        })}

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
            {selectedOptions.size &&
              (() => {
                const sizeOption = item.options_grouped?.size?.find(
                  (s) => s.id === selectedOptions.size
                );

                if (!sizeOption) return null;

                return (
                  <p>
                    {lang === "ar" ? "الحجم" : "Size"} ({sizeOption.name}): +
                    {parseFloat(sizeOption.price).toFixed(2)}{" "}
                    {lang === "ar" ? "جنيه" : "$"}
                  </p>
                );
              })()}
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
