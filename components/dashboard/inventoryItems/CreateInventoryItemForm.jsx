"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { addManualInventoryItem } from "@/lib/inventoryItemsApi";
import { useLanguage } from "@/context/LanguageContext";
import { useRouter } from "next/navigation";

function CreateInventoryItemForm({ onSuccess, onCancel, restaurant_id }) {
  const [formData, setFormData] = useState({
    name: "",
    unit: "",
    quantity: "",
    total_price: "",
    received_at: "",
    expires_at: "",
    restaurant_id: restaurant_id,
  });

  const [isLoading, setIsLoading] = useState(false);
  const { lang } = useLanguage();
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.unit.trim() ||
      !formData.quantity ||
      !formData.total_price
    ) {
      toast.error(
        lang === "ar" ? "الرجاء إدخال جميع الحقول" : "Fill all fields"
      );
      return;
    }

    setIsLoading(true);

    try {
      const res = await addManualInventoryItem(formData);

      toast.success(
        lang === "ar" ? "تم إضافة الصنف بنجاح" : "Item created successfully"
      );

      onSuccess && onSuccess(res.item);
      onCancel && onCancel();
      router.refresh();
    } catch (err) {
      console.error(err);
      toast.error(lang === "ar" ? "فشل إنشاء الصنف" : "Failed to create item");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 rounded-xl shadow-lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>{lang === "ar" ? "اسم الصنف" : "Item Name"}</Label>
          <Input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>{lang === "ar" ? "الوحدة" : "Unit"}</Label>
          <select
            name="unit"
            value={formData.unit}
            onChange={handleChange}
            required
            className="w-full rounded-md border p-2 bg-black dark:bg-neutral-900 dark:border-neutral-700"
          >
            <option className="bg-black" value="">
              {lang === "ar" ? "اختر الوحدة" : "Select unit"}
            </option>

            <option value="kg">kg (كيلو)</option>
            <option value="g">g (جرام)</option>
            <option value="l">l (لتر)</option>
            <option value="ml">ml (مل)</option>
            <option value="m">m (متر)</option>
            <option value="cm">cm (سم)</option>
            <option value="unit">unit (قطعة)</option>
            <option value="box">box (علبة/صندوق)</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>{lang === "ar" ? "الكمية" : "Quantity"}</Label>
          <Input
            name="quantity"
            type="number"
            value={formData.quantity}
            onChange={handleChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>{lang === "ar" ? "السعر الكلي" : "Total Price"}</Label>
          <Input
            name="total_price"
            type="number"
            value={formData.total_price}
            onChange={handleChange}
            required
          />
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label>{lang === "ar" ? "تاريخ الاستلام" : "Received At"}</Label>
          <input
            type="date"
            name="received_at"
            value={formData.received_at}
            onChange={handleChange}
            className="
    w-full p-2 rounded-md border
    bg-neutral-900 text-white
    border-neutral-700
    focus:outline-none focus:ring-2 focus:ring-indigo-500
    dark:bg-neutral-900 dark:text-white
    dark:border-neutral-700
  "
          />
        </div>

        <div className="space-y-2">
          <Label>{lang === "ar" ? "تاريخ الانتهاء" : "Expires At"}</Label>
          <input
            type="date"
            name="expires_at"
            value={formData.expires_at}
            onChange={handleChange}
            className="
    w-full p-2 rounded-md border
    bg-neutral-900 text-white
    border-neutral-700
    focus:outline-none focus:ring-2 focus:ring-indigo-500
    dark:bg-neutral-900 dark:text-white
    dark:border-neutral-700
  "
          />
        </div>
      </div>

      <Separator />

      <div className="flex justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel}>
          {lang === "ar" ? "إلغاء" : "Cancel"}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? lang === "ar"
              ? "جاري الإضافة..."
              : "Creating..."
            : lang === "ar"
            ? "إضافة صنف"
            : "Create Item"}
        </Button>
      </div>
    </motion.form>
  );
}

export default CreateInventoryItemForm;
