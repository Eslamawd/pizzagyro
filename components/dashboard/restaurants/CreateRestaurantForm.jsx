"use client";

import React, { useState } from "react";
import { Button } from "../../ui/button";
import { Input } from "../../ui/Input";
import { Label } from "../../ui/Label";
import { Separator } from "../../ui/Separator";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { addNewRestaurant } from "@/lib/restaurantApi";
import Image from "next/image";
import { useLanguage } from "@/context/LanguageContext";
import LocationPicker from "@/components/delivry/LocationPicker";

function CreateRestaurantForm({ onSuccess, onCancel }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "restaurant",
    phone: "",
    address: "",
    latitude: "", // الإحداثيات
    longitude: "",

    logo: null,
    cover: null,
  });
  const [preview, setPreview] = useState({ logo: "", cover: "" });
  const [isLoading, setIsLoading] = useState(false);
  const { lang } = useLanguage();
  const router = useRouter();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLocationSelect = (loc) => {
    setFormData((prev) => ({
      ...prev,
      address: loc.address, // تحديث العنوان النصي تلقائياً
      latitude: loc.lat,
      longitude: loc.lng,
    }));
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
    if (
      !formData.name.trim() ||
      !formData.phone.trim() ||
      !formData.address.trim()
    ) {
      toast.error(
        lang === "ar"
          ? "الرجاء إدخال جميع الحقول المطلوبة"
          : "Please fill all required fields"
      );
      return;
    }

    // ✅ التحقق من logo و cover
    if (!formData.logo) {
      toast.error(
        lang === "ar"
          ? "يرجى رفع شعار المطعم"
          : "Please upload the restaurant logo"
      );
      return;
    }

    if (!formData.cover) {
      toast.error(
        lang === "ar" ? "يرجى رفع صورة الغلاف" : "Please upload the cover image"
      );
      return;
    }
    const formDataObj = new FormData();
    for (const key in formData) {
      formDataObj.append(key, formData[key]);
    }

    setIsLoading(true);
    try {
      const res = await addNewRestaurant(formDataObj);
      if (res?.active === false) {
        toast.error(
          lang === "ar" ? res.message?.message_ar : res.message?.message
        );
        return;
      }
      if (res) {
        toast.success(
          lang === "ar"
            ? "تم إنشاء المطعم بنجاح ✅"
            : "Restaurant created successfully ✅"
        );
        onSuccess && onSuccess(res);
        onCancel && onCancel();
        router.refresh();
      }
    } catch (err) {
      console.error("Error creating restaurant:", err);
      toast.error(
        lang === "ar"
          ? "حدث خطأ أثناء إنشاء المطعم"
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
            {lang === "ar" ? "اسم المطعم" : "Restaurant Name"}
          </Label>
          <Input
            id="name"
            name="name"
            type="text"
            placeholder={
              lang === "ar" ? "أدخل اسم المطعم" : "Enter restaurant name"
            }
            value={formData.name}
            onChange={handleInputChange}
            required
          />
        </div>
        {/* Type */}
        <div className="space-y-2">
          <Label htmlFor="type">{lang === "ar" ? "النوع" : "Type"}</Label>
          <select
            id="type"
            name="type"
            value={formData.type}
            onChange={handleInputChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option className="bg-blue-900" value="restaurant">
              {lang === "ar" ? "مطعم" : "Restaurant"}
            </option>
            <option className="bg-blue-900" value="coffee">
              {lang === "ar" ? "كوفي شوب" : "Coffee Shop"}
            </option>
          </select>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            {lang === "ar" ? "رقم الهاتف" : "Phone"}
          </Label>
          <Input
            id="phone"
            name="phone"
            type="text"
            placeholder={
              lang === "ar" ? "أدخل رقم الهاتف" : "Enter phone number"
            }
            value={formData.phone}
            onChange={handleInputChange}
            required
          />
        </div>

        {/* Address */}
        <div className="space-y-2">
          <Label htmlFor="address">
            {lang === "ar" ? "العنوان" : "Address"}
          </Label>
          <Input
            id="address"
            name="address"
            type="text"
            placeholder={
              lang === "ar" ? "أدخل عنوان المطعم" : "Enter restaurant address"
            }
            value={formData.address}
            onChange={handleInputChange}
            required
          />
        </div>
      </div>

      <Separator />
      {/* Location Picker */}

      <div className="md:col-span-2 space-y-2">
        <Label>Select Location Restaurant</Label>
        <LocationPicker
          location={{
            lat: formData.latitude,
            lng: formData.longitude,
            isSet: !!formData.latitude,
          }}
          setLocation={handleLocationSelect}
          onClose={() => {}} // يمكنك تركها فارغة هنا
        />
      </div>

      {/* Logo Upload */}
      <div className="space-y-2">
        <Label htmlFor="logo">
          {lang === "ar" ? "شعار المطعم" : "Restaurant Logo"}
        </Label>
        <Input
          id="logo"
          name="logo"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {preview.logo && (
          <div className="mt-3">
            <Image
              src={preview.logo}
              alt="Logo preview"
              width={100}
              height={100}
              className="rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Cover Upload */}
      <div className="space-y-2">
        <Label htmlFor="cover">
          {lang === "ar" ? "صورة الغلاف" : "Cover Image"}
        </Label>
        <Input
          id="cover"
          name="cover"
          type="file"
          accept="image/*"
          onChange={handleFileChange}
        />
        {preview.cover && (
          <div className="mt-3">
            <Image
              src={preview.cover}
              alt="Cover preview"
              width={200}
              height={120}
              className="rounded-lg"
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
            ? "إنشاء المطعم"
            : "Create Restaurant"}
        </Button>
      </div>
    </motion.form>
  );
}

export default CreateRestaurantForm;
