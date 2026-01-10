"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";
import { Trash2, Pencil, PlusCircle, Eye } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

import { useLanguage } from "@/context/LanguageContext";
import {
  addNewOption,
  deleteOption,
  getOption,
  updateOption,
} from "@/lib/optionApi";

const OptionsManagement = ({ optionsGrouped, itemId }) => {
  const [optionsState, setOptionsState] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isNew, setIsNew] = useState(false);

  const { lang } = useLanguage();

  useEffect(() => {
    if (!optionsGrouped) return;

    const formatted = Object.entries(optionsGrouped).map(([type, options]) => ({
      type, // dough | sauce | size | extra | filling
      options, // array of options
    }));

    setOptionsState(formatted);
  }, [optionsGrouped]);

  // ✅ إضافة كاتيجوري جديدة
  const handleAddNew = () => {
    setIsNew(true);
    setSelectedOption(null);
    setIsDialogOpen(true);
  };

  // ✅ تعديل كاتيجوري
  const handleEdit = (option) => {
    setIsNew(false);
    setSelectedOption(option);
    setIsDialogOpen(true);
  };

  // ✅ حذف كاتيجوري
  const handleDelete = (option) => {
    setSelectedOption(option);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteOption(selectedOption.id);
      setOptionsState((prev) =>
        prev
          .map((group) => ({
            ...group,
            options: group.options.filter((o) => o.id !== selectedOption.id),
          }))
          .filter((group) => group.options.length > 0)
      );

      setShowDeleteDialog(false);
      toast.success(
        lang === "ar" ? "تم حذف القسم بنجاح" : "Option deleted successfully"
      );
    } catch (err) {
      toast.error(lang === "ar" ? "فشل حذف القسم" : "Failed to delete option");
    }
  };

  return (
    <motion.div
      dir={lang === "ar" ? "rtl" : "ltr"}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 16 }}
      className="min-h-screen"
    >
      <Card>
        <CardHeader className="flex items-center justify-between pb-2">
          <CardTitle className="text-xl font-bold">
            {lang === "ar" ? "إدارة الخيارات" : "Manage Options"}
          </CardTitle>
          <div className="flex items-center gap-3">
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-5 w-5" />{" "}
              {lang === "ar" ? "خيار جديد" : "New Option"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {optionsState.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p className="text-lg font-medium">
                {lang === "ar" ? "لا يوجد خيارات" : "No Options yet"}
              </p>
            </div>
          ) : (
            <div className="p-2 sm:p-4">
              {optionsState.map((group) => (
                <div key={group.type} className="mb-8">
                  <h2 className="text-lg font-bold mb-4 text-white capitalize">
                    {group.type}
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {group.options.map((option) => (
                      <OptionCard
                        key={option.id}
                        option={option}
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog الإضافة والتعديل */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-950/95 border border-white/10 shadow-2xl backdrop-blur-md text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {isNew
                ? lang === "ar"
                  ? "إضافة خيار جديد"
                  : "Add New Option"
                : lang === "ar"
                ? "تعديل خيار"
                : "Edit Option"}
            </DialogTitle>
            <DialogDescription>
              {lang === "ar"
                ? "أدخل اسم الخيار ثم احفظ التغييرات"
                : "Enter the Option name and save changes"}
            </DialogDescription>
          </DialogHeader>

          <OptionForm
            isNew={isNew}
            option={selectedOption}
            itemId={itemId}
            onSuccess={(saved) => {
              setOptionsState((prev) => {
                const groupIndex = prev.findIndex(
                  (g) => g.type === saved.option_type
                );

                // الجروب موجود
                if (groupIndex !== -1) {
                  const updated = [...prev];
                  updated[groupIndex] = {
                    ...updated[groupIndex],
                    options: isNew
                      ? [saved, ...updated[groupIndex].options]
                      : updated[groupIndex].options.map((o) =>
                          o.id === saved.id ? saved : o
                        ),
                  };
                  return updated;
                }

                // جروب جديد
                return [...prev, { type: saved.option_type, options: [saved] }];
              });

              setIsDialogOpen(false);
            }}
            onCancel={() => setIsDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog الحذف */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-950/95 border border-white/10 shadow-2xl backdrop-blur-md text-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lang === "ar"
                ? "سيتم حذف القسم وجميع الأصناف بداخله."
                : "This will delete the option and all its items."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-red-600 text-white"
            >
              {lang === "ar" ? "حذف" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  );
};

const OptionCard = ({ option, onEdit, onDelete }) => {
  const { lang } = useLanguage();
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 220, damping: 15 }}
      className="relative bg-white/10 p-4 rounded-2xl shadow-lg flex flex-col justify-between m-2"
    >
      <div>
        {option.image && (
          <img
            src={option.image}
            alt={option.name}
            className="w-full h-40 object-cover rounded-xl mb-3"
          />
        )}
        <h3 className="text-lg font-semibold text-white mb-2">
          {lang === "ar" ? option.name : option.name_en}
        </h3>
        {option.price > 0 ? (
          <p className="text-sm text-gray-300">
            {lang === "ar" ? "السعر: " : "Price: "} {option.price} $
          </p>
        ) : (
          <p className="text-sm text-gray-300">
            {lang === "ar" ? "السعر: مجاني" : "Price: Free"}
          </p>
        )}
      </div>

      <div className="flex justify-between items-center mt-auto pt-3 border-t border-white/10">
        <div className="flex gap-2">
          <Button size="icon" variant="outline" onClick={() => onEdit(option)}>
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => onDelete(option)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const OptionForm = ({ isNew, option, itemId, onSuccess, onCancel }) => {
  const [name, setName] = useState(option?.name || "");
  const [price, setPrice] = useState(option?.price || "");
  const [half, setHalf] = useState(option?.half || false);
  const [option_type, setOptionType] = useState(option?.option_type || "");
  // ✅ السعر الصحيح
  const { lang } = useLanguage();

  const handleSubmit = async () => {
    try {
      const payload = {
        name,
        price,
        half,
        option_type: option_type,
        item_id: itemId,
      };

      const res = isNew
        ? await addNewOption(payload)
        : await updateOption(option.id, payload);

      onSuccess(res);

      toast.success(
        isNew
          ? lang === "ar"
            ? "تم إضافة الخيار بنجاح"
            : "Option added successfully"
          : lang === "ar"
          ? "تم تحديث الخيار بنجاح"
          : "Option updated successfully"
      );
    } catch (err) {
      console.error(err);
      toast.error(lang === "ar" ? "حدث خطأ أثناء العملية" : "Action failed");
    }
  };

  const optionTypes = [
    { id: "dough", ar: "نوع العجينة", en: "Dough Type" },
    { id: "filling", ar: "نوع المحشي/الحشوة", en: "Filling Type" },
    { id: "sauce", ar: "نوع الصوص", en: "Sauce Type" },
    { id: "size", ar: "الحجم", en: "Size" },
    { id: "extra", ar: "إضافات", en: "Extras" },
    { id: "topping", ar: "الإضافات العلوية", en: "Toppings" },
    { id: "drink_size", ar: "حجم المشروب", en: "Drink Size" },
    { id: "bread_type", ar: "نوع الخبز", en: "Bread Type" },
    { id: "cheese_type", ar: "نوع الجبن", en: "Cheese Type" },
    { id: "meat_type", ar: "نوع اللحم", en: "Meat Type" },
    { id: "vegetable_type", ar: "نوع الخضار", en: "Vegetable Type" },
    { id: "spice_level", ar: "درجة التوابل", en: "Spice Level" },
    { id: "crust_type", ar: "نوع القشرة", en: "Crust Type" },
    { id: "cooking_preference", ar: "تفضيل الطهي", en: "Cooking Preference" },
    { id: "other", ar: "أخرى", en: "Other" },
  ];

  return (
    <>
      {/* اسم الخيار */}
      <input
        className="w-full p-3 mt-4 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-white/30"
        placeholder={lang === "ar" ? "اسم الخيار" : "Option name"}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      {/* سعر الخيار */}
      <input
        type="number"
        className="w-full p-3 mt-4 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-white/30"
        placeholder={
          lang === "ar" ? "سعر الخيار (اختياري)" : "Option price (optional)"
        }
        value={price}
        onChange={(e) => setPrice(e.target.value)}
      />

      <label className="flex items-center gap-2 mt-4  text-sm">
        <input
          type="checkbox"
          checked={half}
          onChange={(e) => setHalf(e.target.checked)}
        />
        {lang === "ar" ? "يسمح بالنصف" : "Allow half"}
      </label>

      <select
        className="w-3/5 p-3 mt-4 bg-gray-800 text-white  rounded-lg border border-gray-700"
        value={option_type}
        onChange={(e) => setOptionType(e.target.value)}
      >
        <option value="">
          {lang === "ar" ? "اختر تصنيف الخيار" : "Select Option Category"}
        </option>
        {optionTypes.map((type) => (
          <option key={type.id} value={type.id}>
            {lang === "ar" ? type.ar : type.en}
          </option>
        ))}
      </select>

      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onCancel}>
          {lang === "ar" ? "إلغاء" : "Cancel"}
        </Button>
        <Button onClick={handleSubmit}>{lang === "ar" ? "حفظ" : "Save"}</Button>
      </DialogFooter>
    </>
  );
};

export default OptionsManagement;
