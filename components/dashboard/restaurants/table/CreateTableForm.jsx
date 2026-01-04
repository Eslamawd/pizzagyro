"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Separator } from "@/components/ui/Separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { addNewTable } from "@/lib/tableApi";
import { useLanguage } from "@/context/LanguageContext";

function CreateTableForm({ onSuccess, onCancel, id }) {
  const [formData, setFormData] = useState({
    name: "",
    restaurant_id: id,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { lang } = useLanguage();
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      toast.error(
        lang === "ar"
          ? "الرجاء إدخال جميع الحقول المطلوبة"
          : "Please fill all required fields"
      );
      return;
    }

    setIsLoading(true);
    try {
      const res = await addNewTable(formData);

      if (res?.active === false) {
        toast.error(
          lang === "ar" ? res.message?.message_ar : res.message?.message
        );
        return;
      }
      if (res) {
        toast.success(
          lang === "ar"
            ? "تم إنشاء الطاولة بنجاح ✅"
            : "Table created successfully ✅"
        );
        onSuccess && onSuccess(res);
        onCancel && onCancel();
      }
    } catch (err) {
      console.error("Error creating Table:", err);
      toast.error(
        lang === "ar"
          ? "حدث خطأ أثناء إنشاء الطاولة"
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
            {lang === "ar" ? "اسم الطاولة" : "Table Name"}
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder={
              lang === "ar" ? "أدخل اسم الطاولة" : "Enter Table name"
            }
            value={formData.name}
            onChange={handleInputChange}
            required
          />
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
            ? "إنشاء الطاولة"
            : "Create Table"}
        </Button>
      </div>
    </motion.form>
  );
}

export default CreateTableForm;
