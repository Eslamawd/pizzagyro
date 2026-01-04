import api from "../api/axiosClient";

/**
 * GET /api/inventory-items/{id}
 * جلب صنف مخزون محدد بواسطة ID.
 */

export async function getInventoryItem(id) {
  const response = await api().get(`api/inventory-items/${id}`);
  return response.data;
}

/**
 * GET /api/inventory-items/restaurant/{restaurant}
 * جلب جميع أصناف المخزون الخاصة بمطعم محدد مع دعم التصفح (Pagination).
 *
 * @param {number} restaurantId مُعرف المطعم
 * @param {number} [page=1] رقم الصفحة للتصفح
 */
export async function getInventoryItemsByRestaurant(restaurantId, page = 1) {
  const response = await api().get(
    `api/inventory-items/restaurant/${restaurantId}`,
    {
      params: { page },
    }
  );
  return response.data;
}

/**
 * POST /api/inventory-items/upload
 * إرسال ملف إكسل لمعالجته في الخلفية.
 *
 * @param {object} uploadData - جسم الطلب يحتوي على 'excel_file', 'name_col_name', إلخ.
 */
export async function uploadExcelInventory(uploadData) {
  // يجب أن يتم إرسال البيانات كـ FormData لأنها تحتوي على ملف
  try {
    const response = await api().post(
      "api/inventory-items/upload",
      uploadData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      return {
        active: false,
        message: error.response?.data?.message || "Subscription expired",
      };
    }
    throw error;
  }
}

/**
 * POST /api/inventory-items/manual
 * إضافة صنف مخزون واحد يدوياً.
 *
 * @param {object} itemData: جسم الطلب بصيغة InventoryItem (object)
 */
export async function addManualInventoryItem(itemData) {
  try {
    const response = await api().post("api/inventory-items/manual", itemData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      return {
        active: false,
        message: error.response?.data?.message || "Subscription expired",
      };
    }
    throw error;
  }
}

/**
 * DELETE /api/inventory-items/{id}
 * حذف صنف مخزون محدد.
 */
export async function deleteInventoryItem(id) {
  const response = await api().delete(`api/inventory-items/${id}`);
  return response.data;
}
