"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { addNewMenu } from "@/lib/menuApi";
import { useLanguage } from "@/context/LanguageContext";
import Image from "next/image";

function CreateMenuForm({ onSuccess, onCancel, id }) {
  const [formData, setFormData] = useState({
    name: "",
    restaurant_id: id,
    image: null,
  });
  const [preview, setPreview] = useState({
    image: null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { lang } = useLanguage();
  const router = useRouter();

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
    const data = new FormData();
    data.append("name", formData.name);
    data.append("restaurant_id", formData.restaurant_id);
    if (formData.image) {
      data.append("image", formData.image);
    }

    setIsLoading(true);
    try {
      const res = await addNewMenu(data);
      if (res) {
        toast.success(
          lang === "ar"
            ? "تم إنشاء القائمة بنجاح ✅"
            : "Menu created successfully ✅"
        );
        onSuccess && onSuccess(res);
        onCancel && onCancel();
        router.refresh();
      }
    } catch (err) {
      console.error("Error creating Menu:", err);
      toast.error(
        lang === "ar"
          ? "حدث خطأ أثناء إنشاء القائمة"
          : "Failed to create restaurant"
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
              <Image
                src={preview.image}
                alt="Logo preview"
                width={100}
                height={100}
                className="rounded-lg"
              />
            </div>
          )}
        </div>
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
            ? "إنشاء القائمة"
            : "Create Menu"}
        </Button>
      </div>
    </motion.form>
  );
}

export default CreateMenuForm;
