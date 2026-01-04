import React, { useCallback, useEffect, useState } from "react";
import { getInventoryItemsByRestaurant } from "@/lib/inventoryItemsApi";
import Pagination from "../../layout/Pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

import CreateInventoryItemForm from "./CreateInventoryItemForm";
import UpdateInventoryItemForm from "./UpdateInventoryItemForm";
import {
  Loader2,
  AlertTriangle,
  Scale,
  Ruler,
  Utensils,
  Plus,
  Download,
  Upload,
  FilePlus,
} from "lucide-react";
import { useCurrency } from "@/context/CurrencyContext";
import { useLanguage } from "@/context/LanguageContext";
import { toast } from "sonner";

// -----------------------------------------------------------------------------
// Mock data (kept for dev/testing). In production the API will be used.
// -----------------------------------------------------------------------------
const DEFAULT_RESTAURANT_ID = 1;

const mockInventoryDataPage1 = {
  current_page: 1,
  data: [
    {
      id: 1,
      name: "طماطم طازجة (اختبار كجم)",
      unit: "kg",
      quantity: 50.0,
      total_price: 150.0,
      unit_price_per_kg: 3.0,
      unit_price_per_gram: 0.003,
      received_at: "2024-10-25T10:00:00Z",
      expires_at: "2024-11-05T00:00:00Z",
    },
    {
      id: 2,
      name: "زيت زيتون بكر ممتاز (اختبار لتر)",
      unit: "l",
      quantity: 10.0,
      total_price: 350.0,
      unit_price_per_liter: 35.0,
      unit_price_per_ml: 0.035,
      received_at: "2024-10-20T08:30:00Z",
      expires_at: null,
    },
  ],
  last_page: 2,
  total: 6,
};

const mockInventoryDataPage2 = {
  current_page: 2,
  data: [
    {
      id: 5,
      name: "قهوة مطحونة (اختبار جرام)",
      unit: "g",
      quantity: 5000.0,
      total_price: 250.0,
      unit_price_per_kg: 50.0,
      unit_price_per_gram: 0.05,
      received_at: "2024-11-20T11:00:00Z",
      expires_at: "2025-09-01T00:00:00Z",
    },
  ],
  last_page: 2,
  total: 6,
};

// -----------------------------------------------------------------------------
// Small helpers
// -----------------------------------------------------------------------------
const UnitIcon = ({ unit }) => {
  if (!unit) return <Utensils className="w-4 h-4 text-gray-300" />;
  switch (unit.toLowerCase()) {
    case "kg":
    case "g":
      return <Scale className="w-4 h-4 text-emerald-400" />;
    case "l":
    case "ml":
      return <Ruler className="w-4 h-4 text-sky-400 rotate-90" />;
    case "m":
    case "cm":
      return <Ruler className="w-4 h-4 text-amber-400" />;
    default:
      return <Utensils className="w-4 h-4 text-gray-300" />;
  }
};

const getUnitLabel = (unit) => {
  if (!unit) return "";
  switch (unit.toLowerCase()) {
    case "kg":
      return "كجم";
    case "g":
      return "جرام";
    case "l":
      return "لتر";
    case "ml":
      return "مل";
    case "m":
      return "متر";
    case "cm":
      return "سم";
    case "unit":
      return "قطعة";
    case "box":
      return "صندوق";
    default:
      return unit;
  }
};

// -----------------------------------------------------------------------------
// Main component (Dark Mode UI)
// -----------------------------------------------------------------------------
export default function InventoryItemsPage({
  restaurantId = DEFAULT_RESTAURANT_ID,
}) {
  const [inventory, setInventory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const { formatPrice } = useCurrency();
  const { lang } = useLanguage();

  const [selectedItem, setSelectedItem] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isNew, setIsNew] = useState(false);

  // Upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [uploadFileName, setUploadFileName] = useState("");

  // Fetch inventory (supports mock + real API shape)
  const fetchInventory = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      // dev-mode mock
      if (restaurantId === DEFAULT_RESTAURANT_ID) {
        await new Promise((r) => setTimeout(r, 350));
        const mock =
          page === 1 ? mockInventoryDataPage1 : mockInventoryDataPage2;
        setInventory(mock);
        setCurrentPage(mock.current_page);
        setLastPage(mock.last_page ?? 1);
        setTotal(mock.total ?? mock.data.length);
        setLoading(false);
        return;
      }

      try {
        const data = await getInventoryItemsByRestaurant(restaurantId, page);
        const inventoryData = data.items ?? data;
        setInventory(inventoryData);
        setCurrentPage(inventoryData.current_page);
        setLastPage(inventoryData.last_page ?? 1);
        setTotal(inventoryData.total);
      } catch (err) {
        console.error(err);
        setError("فشل في جلب بيانات المخزون. يرجى التحقق من اتصال الشبكة.");
      } finally {
        setLoading(false);
      }
    },
    [restaurantId]
  );

  useEffect(() => {
    fetchInventory(currentPage);
  }, [fetchInventory, currentPage]);

  const openCreateDialog = () => {
    setSelectedItem(null);
    setIsNew(true);
    setIsDialogOpen(true);
  };

  const openEditDialog = (item) => {
    setSelectedItem(item);
    setIsNew(false);
    setIsDialogOpen(true);
  };

  const handleImportClick = () => setIsUploadOpen(true);

  const handleFileSelect = (file) => {
    if (!file) return;
    setUploadFileName(file.name);
    // Mock process: here you'd send file to backend, parse and import records
    setTimeout(() => {
      toast.success(
        lang === "ar" ? "تم استيراد الملف (محاكاة)" : "File imported (mock)"
      );
      setIsUploadOpen(false);
      // After import — refetch first page
      fetchInventory(1);
    }, 700);
  };

  const renderPriceDetails = (item) => {
    if (!item) return null;
    if (item.unit_price_per_kg) {
      return (
        <div className="text-sm">
          <p className="text-emerald-300">
            سعر الكيلو: {formatPrice(item.unit_price_per_kg)}
          </p>
          {item.unit_price_per_gram && (
            <p className="text-emerald-400">
              سعر الجرام: {formatPrice(item.unit_price_per_gram)}
            </p>
          )}
        </div>
      );
    }

    if (item.unit_price_per_liter) {
      return (
        <div className="text-sm">
          <p className="text-sky-300">
            سعر اللتر: {formatPrice(item.unit_price_per_liter)}
          </p>
          {item.unit_price_per_ml && (
            <p className="text-sky-400">
              سعر المل: {formatPrice(item.unit_price_per_ml)}
            </p>
          )}
        </div>
      );
    }

    if (item.unit_price_per_meter) {
      return (
        <div className="text-sm">
          <p className="text-amber-300">
            سعر المتر: {formatPrice(item.unit_price_per_meter)}
          </p>
          {item.unit_price_per_cm && (
            <p className="text-amber-400">
              سعر السنتيمتر: {formatPrice(item.unit_price_per_cm)}
            </p>
          )}
        </div>
      );
    }

    if (item.unit === "unit" || item.unit === "box") {
      const unitPrice = item.quantity ? item.total_price / item.quantity : 0;
      return (
        <p className="text-sm text-gray-300 font-medium">
          سعر الوحدة: {formatPrice(unitPrice)} / {getUnitLabel(item.unit)}
        </p>
      );
    }

    return <p className="text-sm text-gray-500">لا يوجد سعر معياري محدد</p>;
  };

  // -------------------------- Render --------------------------
  if (loading && !inventory) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
        <span className="mr-2 text-indigo-300">جاري تحميل المخزون...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 text-gray-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-semibold">سجلات مخزن المطعم</h1>
          <p className="text-sm text-gray-400 mt-1">لوحة تحكم المخزن</p>
        </div>

        {/* Action buttons (always visible) */}
        <div className="flex items-center gap-3">
          <button
            onClick={openCreateDialog}
            className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg shadow"
          >
            <Plus className="w-4 h-4" />
            {lang === "ar" ? "إنشاء صنف" : "Create"}
          </button>

          <button
            onClick={handleImportClick}
            className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg shadow"
          >
            <Upload className="w-4 h-4" />
            {lang === "ar" ? "استيراد Excel" : "Import"}
          </button>

          <button
            onClick={() => {
              // small helper example for export (mock)
              toast(
                lang === "ar" ? "تم تنزيل الملف (محاكاة)" : "Exported (mock)"
              );
            }}
            className="inline-flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 px-4 py-2 rounded-lg border border-gray-700"
          >
            <Download className="w-4 h-4" />
            {lang === "ar" ? "تصدير" : "Export"}
          </button>
        </div>
      </div>

      {/* Content Card */}
      <div className="rounded-2xl shadow-lg border bg-gray-900 border-gray-800 overflow-hidden">
        {/* Table or empty state */}
        <div className="p-4 md:p-6">
          {(!inventory || inventory.data.length === 0) && !loading ? (
            <div className="text-center py-16">
              <div className="flex items-center justify-center mb-4">
                <FilePlus className="w-12 h-12 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-200">
                لا توجد أصناف مخزون لعرضها
              </h3>
              <p className="text-sm text-gray-400 mt-2">
                اضغط على "إنشاء صنف" أو "استيراد Excel" لإضافة بيانات.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800">
                <thead className="bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      اسم الصنف
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      الكمية
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      السعر الإجمالي
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      أسعار الوحدة المرجعية
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      تاريخ الاستلام
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider">
                      تاريخ الانتهاء
                    </th>
                  </tr>
                </thead>

                <tbody className="bg-gray-900 divide-y divide-gray-800">
                  {(inventory?.data ?? []).map((item) => (
                    <tr key={item.id} className="hover:bg-gray-800 transition">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100">
                        {item.name}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        <div className="flex items-center gap-2">
                          <UnitIcon unit={item.unit} />
                          <div>
                            <div className="text-sm font-medium">
                              {item.quantity}
                            </div>
                            <div className="text-xs text-gray-400">
                              {getUnitLabel(item.unit)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-semibold text-indigo-300">
                        {formatPrice(item.total_price)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {renderPriceDetails(item)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-300">
                        {item.received_at
                          ? new Date(item.received_at).toLocaleDateString(
                              "ar-EG"
                            )
                          : "-"}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">
                        {item.expires_at ? (
                          <span className="px-3 py-1 rounded-full text-xs bg-red-800/60 text-red-200">
                            {new Date(item.expires_at).toLocaleDateString(
                              "ar-EG"
                            )}
                          </span>
                        ) : (
                          <span className="px-3 py-1 rounded-full text-xs bg-green-800/40 text-green-200">
                            مفتوح
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination footer */}
        <div className="px-4 py-3 border-t border-gray-800 bg-gray-900/50 flex items-center justify-between">
          <div className="text-sm text-gray-400">
            {lang === "ar" ? `${total} صنف` : `${total} items`}
          </div>

          <div>
            <Pagination
              currentPage={currentPage}
              lastPage={lastPage}
              total={total}
              label={lang === "ar" ? "العناصر" : "Items"}
              onPrev={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              onNext={() =>
                setCurrentPage((p) =>
                  Math.min(p + 1, inventory.last_page ?? lastPage)
                )
              }
            />
          </div>
        </div>
      </div>

      {/* Create / Update Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="w-[95%]  h-[90%] max-w-xl sm:max-w-2xl md:max-w-3xl  rounded-2xl bg-gray-950 border border-gray-800 p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 border-b border-gray-800">
            <DialogTitle className="text-lg font-semibold">
              {isNew
                ? lang === "ar"
                  ? "إضافة صنف جديد"
                  : "Add Item"
                : lang === "ar"
                ? "تعديل الصنف"
                : "Update Item"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-400">
              {isNew
                ? lang === "ar"
                  ? "املأ بيانات الصنف لإنشاءه."
                  : "Fill item details to create."
                : lang === "ar"
                ? "قم بتعديل بيانات الصنف ثم احفظ."
                : "Edit item details and save."}
            </DialogDescription>
          </DialogHeader>

          <div className="p-6">
            {isNew ? (
              <CreateInventoryItemForm
                restaurant_id={restaurantId}
                onSuccess={(newItem) => {
                  setInventory((prev) => ({
                    ...(prev ?? { data: [] }),
                    data: [newItem, ...(prev?.data ?? [])],
                    total: (prev?.total ?? 0) + 1,
                  }));
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
              <UpdateInventoryItemForm
                item={selectedItem}
                onSuccess={(updated) => {
                  setInventory((prev) => ({
                    ...(prev ?? {}),
                    data: (prev?.data ?? []).map((it) =>
                      it.id === updated.id ? updated : it
                    ),
                  }));
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
          </div>

          <DialogFooter className="px-6 py-4 border-t border-gray-800">
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 rounded bg-gray-800 text-gray-200"
                onClick={() => setIsDialogOpen(false)}
              >
                {lang === "ar" ? "إلغاء" : "Cancel"}
              </button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog (simple) */}
      <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
        <DialogContent className="w-[95%] max-w-xl sm:max-w-2xl md:max-w-3xl rounded-2xl bg-gray-950 border border-gray-800 p-6 h-[80%]">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              {lang === "ar" ? "استيراد ملف Excel" : "Import Excel"}
            </DialogTitle>
            <DialogDescription className="text-sm text-gray-400">
              {lang === "ar"
                ? "اختَر ملف Excel أو CSV لاستيراد بيانات المخزون."
                : "Choose an Excel or CSV file to import inventory records."}
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4">
            <label className="block text-sm text-gray-300 mb-2">
              {lang === "ar" ? "اختر ملف" : "Select file"}
            </label>
            <input
              type="file"
              accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
              className="block w-full text-sm text-gray-200 file:bg-gray-800 file:text-gray-200 file:rounded file:px-3 file:py-2"
              onChange={(e) => handleFileSelect(e.target.files?.[0])}
            />
            {uploadFileName && (
              <div className="mt-3 text-sm text-gray-300">
                {lang === "ar" ? "الملف المحدد:" : "Selected:"} {uploadFileName}
              </div>
            )}
          </div>

          <DialogFooter className="mt-6 flex justify-end">
            <button
              className="px-4 py-2 bg-gray-800 text-gray-200 rounded mr-2"
              onClick={() => setIsUploadOpen(false)}
            >
              {lang === "ar" ? "إلغاء" : "Cancel"}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
