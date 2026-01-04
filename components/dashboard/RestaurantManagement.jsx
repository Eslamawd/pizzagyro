"use client";
import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/Card";
import { toast } from "sonner";
import { Trash2, Pencil, Eye, MapPin } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/Dialog";
import Pagination from "../layout/Pagination";
import { useLanguage } from "@/context/LanguageContext";
import { useCurrency } from "@/context/CurrencyContext";
import {
  loadRestaurants,
  createRestaurant,
  updateRestaurant,
  deleteRestaurant,
  loadRestaurantsByAdmin,
} from "@/lib/restaurantApi";
import CreateRestaurantForm from "./restaurants/CreateRestaurantForm";
import UpdateRestaurantForm from "./restaurants/UpdateRestaurantForm";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { usePathname } from "next/navigation";

const RestaurantManagement = ({ userId }) => {
  const [restaurants, setRestaurants] = useState([]);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const { lang } = useLanguage();
  const [isNew, setIsNew] = useState(false);
  const [isUpdate, setIsUpdate] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const { user } = useAuth();

  const pathname = usePathname();

  // الصفحات اللي مش عايز فيها Header و Footer
  const hideLayoutRoutes = ["/admin"];
  const shouldHideLayout = hideLayoutRoutes.some((path) =>
    pathname.startsWith(path)
  );

  const fetchRestaurants = async (page = 1) => {
    try {
      const res =
        user.role === "admin" && shouldHideLayout
          ? await loadRestaurantsByAdmin(page, userId)
          : await loadRestaurants(page);
      const data = res?.data || res || [];
      setRestaurants(Array.isArray(data) ? data : data.items || []);
      setTotalPages(res?.meta?.last_page || res?.last_page || 1);
      if (
        (Array.isArray(data) && data.length === 0) ||
        (data.items && data.items.length === 0)
      ) {
        toast.info(
          lang === "ar" ? "لا يوجد مطاعم" : "No restaurants available"
        );
      }
    } catch (error) {
      console.error("Failed to load restaurants", error);
      toast.error(
        lang === "ar" ? "خطأ في تحميل المطاعم" : "Failed to load restaurants"
      );
    }
  };

  useEffect(() => {
    fetchRestaurants(currentPage);
  }, [currentPage]);

  const handleDeleteRestaurant = (rest) => {
    setSelectedRestaurant(rest);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedRestaurant) return;
    try {
      await deleteRestaurant(selectedRestaurant.id);
      setRestaurants((prev) =>
        prev.filter((r) => r.id !== selectedRestaurant.id)
      );
      setShowDeleteDialog(false);
      toast.success(
        lang === "ar"
          ? `${
              selectedRestaurant.name_ar || selectedRestaurant.name
            } تم الحذف بنجاح`
          : `${selectedRestaurant.name} deleted successfully`
      );
      setSelectedRestaurant(null);
    } catch (error) {
      console.error("Failed to delete restaurant", error);
      toast.error(
        lang === "ar" ? "فشل حذف المطعم" : "Failed to delete restaurant"
      );
    }
  };

  const handleEditRestaurant = (rest) => {
    setSelectedRestaurant(rest);
    setIsNew(false);
    setIsUpdate(true);
    setIsDialogOpen(true);
  };

  const handleAddNewRestaurant = () => {
    setIsNew(true);
    setIsUpdate(false);
    setSelectedRestaurant(null);
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
            {lang === "ar" ? "إدارة المطاعم" : "Restaurants Management"}
          </CardTitle>
          <div className="flex items-center gap-3">
            <Button onClick={handleAddNewRestaurant}>
              + {lang === "ar" ? "مطعم جديد" : "New Restaurant"}
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {restaurants.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
              <p className="text-lg font-medium">
                {lang === "ar" ? "لا يوجد مطاعم" : "No restaurants yet"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 xs:grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 p-2 sm:p-4">
              {restaurants.map((rest) => (
                <RestaurantCard
                  shouldHideLayout={shouldHideLayout}
                  key={rest.id}
                  restaurant={rest}
                  onEdit={handleEditRestaurant}
                  onDelete={handleDeleteRestaurant}
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-950/95 border border-white/10 shadow-2xl backdrop-blur-md text-white rounded-2xl">
          <DialogHeader>
            <DialogTitle>
              {isNew
                ? lang === "ar"
                  ? "إضافة مطعم جديد"
                  : "Add Restaurant"
                : lang === "ar"
                ? "تعديل المطعم"
                : "Update Restaurant"}
            </DialogTitle>
            <DialogDescription>
              {isNew
                ? lang === "ar"
                  ? "املأ بيانات المطعم لإنشاءه."
                  : "Fill restaurant details to create."
                : lang === "ar"
                ? "قم بتعديل بيانات المطعم ثم احفظ."
                : "Edit restaurant details and save."}
            </DialogDescription>
          </DialogHeader>

          {isNew ? (
            <CreateRestaurantForm
              onSuccess={(newRest) => {
                setRestaurants((prev) => [newRest, ...prev]);
                setIsDialogOpen(false);
              }}
              onCancel={() => setIsDialogOpen(false)}
            />
          ) : (
            <UpdateRestaurantForm
              restaurant={selectedRestaurant}
              onSuccess={(updated) => {
                setRestaurants((prev) =>
                  prev.map((r) => (r.id === updated.id ? updated : r))
                );
                setIsDialogOpen(false);
              }}
              onCancel={() => setIsDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-gradient-to-b from-gray-900/95 via-gray-900/90 to-gray-950/95 border border-white/10 shadow-2xl backdrop-blur-md text-white rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {lang === "ar" ? "هل أنت متأكد؟" : "Are you sure?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {lang === "ar"
                ? "سيتم حذف المطعم وكل ما يتعلق به (قوائم، أصناف). لا يمكن التراجع."
                : "This will delete the restaurant and all related data (menus, categories, items). This action cannot be undone."}
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

const RestaurantCard = ({ restaurant, onEdit, onDelete, shouldHideLayout }) => {
  const { lang } = useLanguage();
  const { formatPrice } = useCurrency();

  const menusCount = restaurant.menus?.length || restaurant.menus_count || 0;
  const address = restaurant.address || restaurant.location || "";

  return (
    <motion.div
      layout
      whileHover={{ scale: 1.03 }}
      transition={{ type: "spring", stiffness: 260, damping: 20 }}
      className="relative rounded-xl p-5 bg-white/10 shadow-card "
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold ">
            {lang === "ar"
              ? restaurant.name_ar || restaurant.name
              : restaurant.name}
          </h3>
          <p className="text-sm  mt-1">
            {restaurant.type || (lang === "ar" ? "مطعم" : "Restaurant")}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={`/${shouldHideLayout ? "admin" : "dashboard"}/restaurants/${
              restaurant.id
            }`}
          >
            <Button size="sm" className="bg-white/20 hover:bg-white/30">
              <Eye className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>

      <p className="text-sm  mt-4 line-clamp-2">{address}</p>
      <a
        href={`https://www.google.com/maps/search/?api=1&query=${restaurant.latitude},${restaurant.longitude}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-sm text-blue-400 hover:underline"
      >
        <MapPin className="inline-block mr-1 mb-1" />
      </a>

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm ">
          <span className="font-semibold">{menusCount}</span>
          <span className="ml-1">{lang === "ar" ? "قوائم" : "Menus"}</span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => onEdit(restaurant)}
          >
            <Pencil className="h-8 w-8" />
          </Button>
          <span
            size="sm"
            variant="outline"
            onClick={() => onDelete(restaurant)}
            className="text-red-600"
          >
            <Trash2 className="h-8 w-8" />
          </span>
        </div>
      </div>
    </motion.div>
  );
};

export default RestaurantManagement;
