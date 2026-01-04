"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { toast } from "sonner";
import { Trash2, Pencil, Eye } from "lucide-react";
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
import { useCurrency } from "@/context/CurrencyContext";
import { deleteItem } from "@/lib/itemsApi";
import CreateItemForm from "./items/CreateItemForm";
import UpdateItemForm from "./items/UpdateItemForm";
import { getCategory } from "@/lib/categoryApi";
import OptionsManagement from "./items-options/OptionsManagement";

const CategoryItemManagement = ({ category_id }) => {
  const [category, setCategory] = useState(null);
  const [items, setItems] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showOptionsDialog, setShowOptionsDialog] = useState(false);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const { lang } = useLanguage();
  const [isNew, setIsNew] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchItems = async (page = 1) => {
    try {
      const res = await getCategory(category_id);
      const data = res?.data || res || {};

      setCategory(data);
      setItems(Array.isArray(data.items) ? data.items : []);
      setTotalPages(res?.meta?.last_page || res?.last_page || 1);

      if (!data.items || data.items.length === 0) {
        toast.info(lang === "ar" ? "لا يوجد أصناف" : "No items available");
      }
    } catch (error) {
      console.error("Failed to load items", error);
      toast.error(
        lang === "ar" ? "خطأ في تحميل الأصناف" : "Failed to load items"
      );
    }
  };

  useEffect(() => {
    fetchItems(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage]);

  const handleDeleteItem = (item) => {
    setSelectedItem(item);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedItem) return;
    try {
      await deleteItem(selectedItem.id);
      setItems((prev) => prev.filter((r) => r.id !== selectedItem.id));
      setShowDeleteDialog(false);
      toast.success(
        lang === "ar"
          ? `${selectedItem.name_ar || selectedItem.name} تم حذفه بنجاح`
          : `${selectedItem.name} deleted successfully`
      );
      setSelectedItem(null);
    } catch (error) {
      console.error("Failed to delete item", error);
      toast.error(lang === "ar" ? "فشل حذف الصنف" : "Failed to delete item");
    }
  };

  const handleShowOptions = (item) => {
    setSelectedItem(item);
    setShowOptionsDialog(true);
  };
  const handleEditItem = (item) => {
    setSelectedItem(item);
    setIsNew(false);
    setIsUpdate(true);
    setIsDialogOpen(true);
  };

  const handleAddNewItem = () => {
    setIsNew(true);
    setIsUpdate(false);
    setSelectedItem(null);
    setIsDialogOpen(true);
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
            {lang === "ar" ? "إدارة الأصناف" : "Items Management"}
          </CardTitle>
          <Button onClick={handleAddNewItem}>
            + {lang === "ar" ? "إضافة صنف" : "Add Item"}
          </Button>
        </CardHeader>

        <CardContent>
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p className="text-lg font-medium">
                {lang === "ar" ? "لا يوجد أصناف" : "No items yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3  gap-4 sm:gap-6 p-2 sm:p-4">
              {items.map((item, index) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  index={index}
                  onShow={handleShowOptions}
                  onEdit={handleEditItem}
                  onDelete={handleDeleteItem}
                />
              ))}
            </div>
          )}

          <div className="mt-6">
            <Pagination
              page={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </div>
        </CardContent>
      </Card>

      {/* Dialog عرض الخيارات */}
      <Dialog open={showOptionsDialog} onOpenChange={setShowOptionsDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-950/95 border border-white/10 shadow-2xl backdrop-blur-md text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {lang === "ar"
                ? "إدارة الإضافات لهذا الصنف"
                : "Manage Options for this Item"}
            </DialogTitle>
            <DialogDescription>
              {lang === "ar"
                ? "يمكنك إضافة أو تعديل أو حذف الخيارات الخاصة بهذا الصنف."
                : "You can add, edit, or delete options for this item."}
            </DialogDescription>
          </DialogHeader>

          {selectedItem ? (
            <OptionsManagement
              optionsGrouped={selectedItem.options_grouped || {}}
              itemId={selectedItem.id}
            />
          ) : (
            <p className="text-center py-4 text-muted-foreground">
              {lang === "ar" ? "لم يتم تحديد صنف بعد" : "No item selected yet"}
            </p>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog (Create / Update) */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-950/95 border border-white/10 shadow-2xl backdrop-blur-md text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {isNew
                ? lang === "ar"
                  ? "إضافة صنف جديد"
                  : "Add Item"
                : lang === "ar"
                ? "تعديل الصنف"
                : "Update Item"}
            </DialogTitle>
            <DialogDescription>
              {isNew
                ? lang === "ar"
                  ? "املأ بيانات الصنف لإنشاءه."
                  : "Fill item details to create."
                : lang === "ar"
                ? "قم بتعديل بيانات الصنف ثم احفظ."
                : "Edit item details and save."}
            </DialogDescription>
          </DialogHeader>

          {isNew ? (
            <CreateItemForm
              category_id={category_id}
              onSuccess={(newItem) => {
                setItems((prev) => [newItem, ...prev]);
                toast.success(
                  lang === "ar"
                    ? "تم إنشاء الصنف بنجاح"
                    : "Item created successfully"
                );
                setIsDialogOpen(false);
              }}
              onCancel={() => setIsDialogOpen(false)}
            />
          ) : (
            <UpdateItemForm
              item={selectedItem}
              onSuccess={(updated) => {
                setItems((prev) =>
                  prev.map((r) => (r.id === updated.id ? updated : r))
                );
                toast.success(
                  lang === "ar"
                    ? "تم تحديث الصنف بنجاح"
                    : "Item updated successfully"
                );
                setIsDialogOpen(false);
              }}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-950/95 border border-white/10 shadow-2xl backdrop-blur-md text-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lang === "ar"
                ? "سيتم حذف الصنف وكل ما يتعلق به. لا يمكن التراجع."
                : "This will delete the item and all related data. This action cannot be undone."}
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

const ItemCard = ({ item, index, onEdit, onDelete, onShow }) => {
  const { lang } = useLanguage();
  const { formatPrice } = useCurrency();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="group bg-card border border-border rounded-2xl overflow-hidden shadow-soft hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      {/* Image */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Content */}
      <div className="flex flex-col justify-between flex-grow p-4 sm:p-5 space-y-3">
        <div>
          <h3 className="font-bold text-lg font-cairo mb-1 text-foreground line-clamp-1">
            {lang === "ar" ? item.name : item.name_en}
          </h3>

          <p className="text-sm text-muted-foreground font-cairo line-clamp-2">
            {lang === "ar" ? item.description : item.description_en}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <span className="text-xl sm:text-2xl font-bold text-primary font-cairo">
            {formatPrice(item.price)}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
            onClick={() => onEdit(item)}
          >
            <Pencil className="h-4 w-4" />
            <span className="hidden sm:inline">
              {lang === "ar" ? "تعديل" : "Edit"}
            </span>
          </Button>
          <Button
            size="sm"
            variant="destructive"
            className="flex items-center gap-1"
            onClick={() => onDelete(item)}
          >
            <Trash2 className="h-4 w-4" />
            <span className="hidden sm:inline">
              {lang === "ar" ? "حذف" : "Delete"}
            </span>
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="destructive"
            className="flex items-center gap-1"
            onClick={() => onShow(item)}
          >
            <Eye className="h-4 w-4" />
            <span className=" ">
              {lang === "ar" ? "إظهار الخيارات" : "Show Options"}
            </span>
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default CategoryItemManagement;
