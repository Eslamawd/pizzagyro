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

import Pagination from "@/components/layout/Pagination";
import { useLanguage } from "@/context/LanguageContext";
import {
  addNewCategory,
  deleteCategory,
  getCategory,
  updateCategory,
} from "@/lib/categoryApi";
import { getMenu } from "@/lib/menuApi";
import Link from "next/link";

const MenuCategoriesManagement = ({ menuId }) => {
  const [categories, setCategories] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [lastPage, setLastPage] = useState(1);
  const { lang } = useLanguage();

  // ✅ تحميل الكاتيجوريز
  const fetchCategories = async (page = 1) => {
    try {
      const res = await getMenu(menuId);
      const data = res.categories || [];
      setCategories(data);
      setTotalPages(1); // مبدئيًا بدون pagination backend
    } catch (err) {
      console.error(err);
      toast.error(
        lang === "ar" ? "فشل تحميل الأقسام" : "Failed to load categories"
      );
    }
  };

  useEffect(() => {
    fetchCategories(currentPage);
  }, [menuId, currentPage]);

  // ✅ إضافة كاتيجوري جديدة
  const handleAddNew = () => {
    setIsNew(true);
    setSelectedCategory(null);
    setIsDialogOpen(true);
  };

  // ✅ تعديل كاتيجوري
  const handleEdit = (category) => {
    setIsNew(false);
    setSelectedCategory(category);
    setIsDialogOpen(true);
  };

  // ✅ حذف كاتيجوري
  const handleDelete = (category) => {
    setSelectedCategory(category);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    try {
      await deleteCategory(selectedCategory.id);
      setCategories((prev) => prev.filter((c) => c.id !== selectedCategory.id));
      setShowDeleteDialog(false);
      toast.success(
        lang === "ar" ? "تم حذف القسم بنجاح" : "Category deleted successfully"
      );
    } catch (err) {
      toast.error(
        lang === "ar" ? "فشل حذف القسم" : "Failed to delete category"
      );
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
            {lang === "ar" ? "إدارة الأقسام" : "Manage Categories"}
          </CardTitle>
          <div className="flex items-center gap-3">
            <Button onClick={handleAddNew}>
              <PlusCircle className="mr-2 h-5 w-5" />{" "}
              {lang === "ar" ? "قسم جديد" : "New Category"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {categories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p className="text-lg font-medium">
                {lang === "ar" ? "لا يوجد أقسام" : "No categories yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2  md:grid-cols-3   p-2 sm:p-4">
              {categories.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}

          <div className="mt-6">
            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              total={total}
              label={lang === "ar" ? "أقسام" : "Categories"}
              onPrev={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              onNext={() =>
                setCurrentPage((prev) => Math.min(prev + 1, lastPage))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog الإضافة والتعديل */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-950/95 border border-white/10 shadow-2xl backdrop-blur-md text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {isNew
                ? lang === "ar"
                  ? "إضافة قسم جديد"
                  : "Add New Category"
                : lang === "ar"
                ? "تعديل القسم"
                : "Edit Category"}
            </DialogTitle>
            <DialogDescription>
              {lang === "ar"
                ? "أدخل اسم القسم ثم احفظ التغييرات"
                : "Enter the category name and save changes"}
            </DialogDescription>
          </DialogHeader>

          <CategoryForm
            isNew={isNew}
            category={selectedCategory}
            menuId={menuId}
            onSuccess={(saved) => {
              if (isNew) setCategories((prev) => [saved, ...prev]);
              else
                setCategories((prev) =>
                  prev.map((c) => (c.id === saved.id ? saved : c))
                );
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
                : "This will delete the category and all its items."}
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

const CategoryCard = ({ category, onEdit, onDelete }) => {
  const { lang } = useLanguage();
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 220, damping: 15 }}
      className="relative bg-white/10 p-4 rounded-2xl shadow-lg flex flex-col justify-between m-2"
    >
      <div>
        {category.image && (
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-40 object-cover rounded-xl mb-3"
          />
        )}
        <h3 className="text-lg font-semibold text-white mb-2">
          {lang === "ar" ? category.name : category.name_en}
        </h3>
      </div>

      <div className="flex justify-between items-center mt-auto pt-3 border-t border-white/10">
        <Link href={`/dashboard/category/${category.id}`}>
          <Button size="sm" className="bg-white/20 hover:bg-white/30">
            <Eye className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex gap-2">
          <Button
            size="icon"
            variant="outline"
            onClick={() => onEdit(category)}
          >
            <Pencil className="w-4 h-4" />
          </Button>
          <Button
            size="icon"
            variant="destructive"
            onClick={() => onDelete(category)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

const CategoryForm = ({ isNew, category, menuId, onSuccess, onCancel }) => {
  const [name, setName] = useState(category?.name || "");
  const { lang } = useLanguage();

  const handleSubmit = async () => {
    try {
      const res = isNew
        ? await addNewCategory({ name, menu_id: menuId })
        : await updateCategory(category.id, { name });

      onSuccess(res);
      toast.success(
        isNew
          ? lang === "ar"
            ? "تم إضافة القسم"
            : "Category added"
          : lang === "ar"
          ? "تم التحديث بنجاح"
          : "Updated successfully"
      );
    } catch (err) {
      console.error(err);
      toast.error(lang === "ar" ? "خطأ في العملية" : "Action failed");
    }
  };

  return (
    <>
      <input
        className="w-full p-3 mt-4 bg-gray-800 text-white rounded-lg border border-gray-700 focus:ring-2 focus:ring-white/30"
        placeholder={lang === "ar" ? "اسم القسم" : "Category name"}
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <DialogFooter className="mt-4">
        <Button variant="outline" onClick={onCancel}>
          {lang === "ar" ? "إلغاء" : "Cancel"}
        </Button>
        <Button onClick={handleSubmit}>{lang === "ar" ? "حفظ" : "Save"}</Button>
      </DialogFooter>
    </>
  );
};

export default MenuCategoriesManagement;
