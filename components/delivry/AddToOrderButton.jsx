"use client";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/Dialog";
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Plus, Minus, ShoppingCart } from "lucide-react";
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
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [comment, setComment] = useState("");
  const [quantity, setQuantity] = useState(1);

  // ✅ تحديث تلقائي للسعر الإجمالي
  const totalPrice = useMemo(() => {
    const optionsTotal = selectedOptions.reduce(
      (sum, opt) => sum + Number(opt.price || 0),
      0
    );
    return (Number(item.price) + optionsTotal) * quantity;
  }, [selectedOptions, item.price, quantity]);

  const toggleOption = (option) => {
    setSelectedOptions((prev) => {
      if (prev.find((opt) => opt.id === option.id)) {
        return prev.filter((opt) => opt.id !== option.id);
      }
      return [...prev, option];
    });
  };

  const handleAdd = () => {
    setRestaurantId(restaurant_id);
    setTableId(table_id || "");
    addToOrder(
      {
        id: item.id,
        name: lang === "ar" ? item.name : item.name_en,
        comment: comment,
        price: parseFloat(item.price),
        image: item.image,
      },
      quantity, // ✅ الكمية المختارة
      selectedOptions
    );
    toast.success(
      `${lang === "ar" ? "تمت إضافة" : "Added"} ${
        lang === "ar" ? item.name : item.name_en
      } (${quantity}x)`
    );
    setOpen(false);
    setSelectedOptions([]);
    setQuantity(1);
    setComment("");
    setSelectedMenu(null);
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

      <DialogContent className="font-cairo bg-black">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-50">
            {lang === "ar" ? "اختيار الإضافات" : "Choose options"}
          </DialogTitle>
        </DialogHeader>

        {item.options?.length > 0 ? (
          <div className="space-y-2">
            {item.options.map((opt) => (
              <label
                key={opt.id}
                className={`flex items-center justify-between border rounded-lg p-3 cursor-pointer transition-all ${
                  selectedOptions.find((o) => o.id === opt.id)
                    ? "bg-blue-100 border-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <div>
                  <p className="font-medium">
                    {lang === "ar" ? opt.name : opt.name_en}
                  </p>
                  <p className="text-sm text-gray-500">{opt.price} جنيه</p>
                </div>
                <input
                  type="checkbox"
                  className="accent-blue-600 w-5 h-5"
                  checked={!!selectedOptions.find((o) => o.id === opt.id)}
                  onChange={() =>
                    toggleOption({
                      id: opt.id,
                      name: lang === "ar" ? opt.name : opt.name_en,
                      name_en: opt.name_en,
                      price: parseFloat(opt.price),
                    })
                  }
                />
              </label>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-center py-3">
            {lang === "ar" ? "لا توجد إضافات" : "No options available"}
          </p>
        )}

        {/* ✅ الكمية */}
        <div className="flex items-center justify-center gap-4 mt-5">
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

        {/* ✅ التعليق */}
        <div className="mt-5">
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
        <div className="mt-6 text-center">
          <p className="text-lg font-bold">
            {lang === "ar" ? "السعر الكلي:" : "Total:"}{" "}
            <span className="text-green-600">
              {totalPrice.toFixed(2)} {lang === "ar" ? "جنيه" : "EGP"}
            </span>
          </p>
        </div>

        <DialogFooter>
          <Button
            onClick={handleAdd}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-cairo mt-4 flex items-center justify-center gap-2"
          >
            <ShoppingCart className="h-4 w-4" />
            {lang === "ar" ? "تأكيد الإضافة" : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
