"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Image from "next/image";
import { updateItem } from "@/lib/itemsApi";
import { useLanguage } from "@/context/LanguageContext";

function UpdateItemForm({ onSuccess, onCancel, item }) {
  const [formData, setFormData] = useState({
    name: item?.name || "",
    description: item?.description || "",
    price: item?.price || "",
    old_price: item?.old_price || "",
    category_id: item?.category_id || "",
    image: null,
  });

  const [preview, setPreview] = useState(item?.image_url || ""); // الصورة القديمة من الـ API
  const [isLoading, setIsLoading] = useState(false);
  const { lang } = useLanguage();
  const router = useRouter();

  // 🧹 تنظيف الذاكرة عند تغيير الصورة
  useEffect(() => {
    return () => {
      if (preview && !preview.startsWith("http")) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  // 📥 Handle text inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 🖼️ Handle file input
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    }
  };

  // 🚀 Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.description.trim() ||
      !formData.price
    ) {
      toast.error(
        lang === "ar"
          ? "الرجاء إدخال جميع الحقول المطلوبة"
          : "Please fill all required fields"
      );
      return;
    }

    const formDataObj = new FormData();

    formDataObj.append("_method", "PUT");
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formDataObj.append(key, value);
      }
    });

    setIsLoading(true);
    try {
      const res = await updateItem(item.id, formDataObj); // تمرير ID الصنف
      if (res) {
        toast.success(
          lang === "ar"
            ? "تم تحديث الصنف بنجاح ✅"
            : "Item updated successfully ✅"
        );
        onSuccess && onSuccess(res);
        onCancel && onCancel();
        router.refresh();
      }
    } catch (err) {
      console.error("Error updating item:", err);
      toast.error(
        lang === "ar" ? "حدث خطأ أثناء تحديث الصنف" : "Failed to update item"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 p-6 rounded-xl shadow-lg "
    >
      {/* 🧾 Basic info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="name">
            {lang === "ar" ? "اسم الصنف" : "Item Name"}
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder={lang === "ar" ? "أدخل اسم الصنف" : "Enter item name"}
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            {lang === "ar" ? "وصف الصنف" : "Item Description"}
          </Label>
          <Textarea
            id="description"
            name="description"
            placeholder={
              lang === "ar" ? "أدخل وصف الصنف" : "Enter item description"
            }
            value={formData.description}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      {/* 💰 Prices */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="price">{lang === "ar" ? "السعر" : "Price"}</Label>
          <Input
            id="price"
            name="price"
            type="number"
            min="0"
            placeholder={lang === "ar" ? "أدخل السعر" : "Enter price"}
            value={formData.price}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="old_price">
            {lang === "ar" ? "السعر القديم" : "Old Price"}
          </Label>
          <Input
            id="old_price"
            name="old_price"
            type="number"
            min="0"
            placeholder={
              lang === "ar"
                ? "أدخل السعر القديم (اختياري)"
                : "Enter old price (optional)"
            }
            value={formData.old_price}
            onChange={handleInputChange}
          />
        </div>
      </div>

      <Separator />

      {/* 🖼️ Image Upload */}
      <div className="space-y-2">
        <Label htmlFor="image">
          {lang === "ar" ? "صورة الصنف" : "Item Image"}
        </Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {preview && (
          <div className="mt-3">
            <Image
              src={preview}
              alt="Preview"
              width={200}
              height={120}
              className="rounded-lg border"
            />
          </div>
        )}
      </div>

      <Separator />

      {/* ⚙️ Actions */}
      <div className="flex justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          {lang === "ar" ? "إلغاء" : "Cancel"}
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading
            ? lang === "ar"
              ? "جارٍ التحديث..."
              : "Updating..."
            : lang === "ar"
            ? "تحديث الصنف"
            : "Update Item"}
        </Button>
      </div>
    </motion.form>
  );
}

export default UpdateItemForm;
