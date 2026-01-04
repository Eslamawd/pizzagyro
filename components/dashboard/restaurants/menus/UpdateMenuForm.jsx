"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { updateMenu } from "@/lib/menuApi";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";

function UpdateMenuForm({ onSuccess, onCancel, menu }) {
  const [formData, setFormData] = useState({
    name: menu?.name || "",
    image: menu?.image || null,
  });
  const [preview, setPreview] = useState({
    image: menu?.image || null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { lang } = useLanguage();
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const { name, files } = e.target;
    const file = files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, [name]: file }));
      setPreview((prev) => ({
        ...prev,
        [name]: URL.createObjectURL(file),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() && !formData.image) {
      toast.error(
        lang === "ar"
          ? "الرجاء إدخال جميع الحقول المطلوبة"
          : "Please fill all required fields"
      );
      return;
    }

    setIsLoading(true);
    try {
      const data = new FormData();
      data.append("name", formData.name);
      if (formData.image) {
        data.append("image", formData.image);
      }
      data.append("_method", "PATCH"); // ← Laravel method spoofing
      const res = await updateMenu(menu.id, data);
      if (res) {
        toast.success(
          lang === "ar"
            ? "تم تحديث القائمة بنجاح ✅"
            : "Menu updated successfully ✅"
        );
        onSuccess && onSuccess(res);
        onCancel && onCancel();
        router.refresh();
      }
    } catch (err) {
      console.error("Error updated Menu:", err);
      toast.error(
        lang === "ar"
          ? "حدث خطأ أثناء تحديث القائمة"
          : "Failed to updated restaurant"
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
      className="space-y-6 p-6 rounded-xl shadow-lg"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Restaurant Name */}
        <div className="space-y-2">
          <Label htmlFor="name">
            {lang === "ar" ? "اسم القائمة" : "Menu Name"}
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder={lang === "ar" ? "أدخل اسم القائمة" : "Enter Menu name"}
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>
      {/* Logo Upload */}
      <div className="space-y-2">
        <Label htmlFor="logo">
          {lang === "ar" ? "Image Menu " : "Image Menu"}
        </Label>
        <Input
          id="image"
          name="image"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {preview.image && (
          <div className="mt-3">
            <img
              src={preview.image}
              alt="Logo preview"
              className="rounded-lg w-100 h-100 object-cover"
            />
          </div>
        )}
      </div>
      <Separator />

      {/* Buttons */}
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
              ? "جارٍ الحفظ..."
              : "Saving..."
            : lang === "ar"
            ? "تحديث القائمة"
            : "Updated Menu"}
        </Button>
      </div>
    </motion.form>
  );
}

export default UpdateMenuForm;
