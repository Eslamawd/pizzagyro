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

const OPTION_GROUP_CONFIG = {
  size: { type: "single", required: true },
  dough: { type: "single", required: false },
  sauce: { type: "single", required: false },
  filling: { type: "single", required: false },
  spice_level: { type: "single", required: false },
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
    if (item && item.options_grouped?.size) {
      setSelectedOptions((prev) => ({
        ...prev,
        size: item.options_grouped.size[0].id,
      }));
    }
  }, [item]);

  // ✅ دالة لحساب السعر النهائي
  const calculateItemTotal = () => {
    let total = Number(item.price);

    Object.entries(selectedOptions).forEach(([groupKey, value]) => {
      const options = item.options_grouped?.[groupKey] || [];

      if (Array.isArray(value)) {
        value.forEach((id) => {
          const opt = options.find((o) => o.id === id);
          if (opt) total += Number(opt.price || 0);
        });
      } else {
        const opt = options.find((o) => o.id === value);
        if (opt) total += Number(opt.price || 0);
      }
    });

    return Number((total * quantity).toFixed(2));
  };

  // ✅ تحديث تلقائي للسعر الإجمالي
  const totalPrice = useMemo(() => {
    return calculateItemTotal();
  }, [selectedOptions, item.price, quantity]);

  const handleOptionSelect = (groupKey, optionId) => {
    const config = OPTION_GROUP_CONFIG[groupKey] || { type: "single" };

    setSelectedOptions((prev) => {
      if (config.type === "multiple") {
        const current = prev[groupKey] || [];
        const exists = current.includes(optionId);

        return {
          ...prev,
          [groupKey]: exists
            ? current.filter((id) => id !== optionId)
            : [...current, optionId],
        };
      }

      // single
      return {
        ...prev,
        [groupKey]: prev[groupKey] === optionId ? null : optionId,
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
        value.forEach((id) => {
          const opt = options.find((o) => o.id === id);
          if (opt) optionsArray.push(opt.id);
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
                    ? (selectedOptions[groupKey] || []).includes(opt.id)
                    : selectedOptions[groupKey] === opt.id;

                  return (
                    <span
                      key={opt.id}
                      onClick={() => handleOptionSelect(groupKey, opt.id)}
                      className={`py-3 rounded-xl border-2 transition-all text-center
                  ${
                    isSelected
                      ? "border-orange-500 bg-orange-50 text-orange-600"
                      : "border-slate-100 text-slate-700"
                  }`}
                    >
                      <div className="font-bold">{opt.name}</div>
                      <div className="text-sm">+${opt.price}</div>
                    </span>
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
