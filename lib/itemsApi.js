// src/lib/itemApi.js

import api from "../api/axiosClient";

// GET /api/items/{id}
export async function getItem(id) {
  const response = await api().get(`api/items/${id}`);
  // نفترض أنّ الـ response.data هو مصفوفة الخدمات
  return response.data;
}

/**
 * POST /api/items
 * @param itemData: جسم الطلب بصيغة Item (object)
 */
export async function addNewItem(itemData) {
  // لا حاجة لتمرير الـ id، Laravel سيولّد id تلقائيًا (بما أننا استخدمنا auto-increment)

  try {
    const response = await api().post("api/items", itemData);
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      return {
        active: false,
        message: error.response?.data || "Subscription expired",
      };
    }
    throw error;
  }
}

/**
 * PUT /api/items/{id}
 * @param itemData: كائن الخدمة يحتوي على id وحقول أخرى محدثة
 */
export async function updateItem(id, paylod) {
  const response = await api().post(`api/items/${id}`, paylod, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * DELETE /api/items/{id}
 */
export async function deleteItem(id) {
  const response = await api().delete(`api/items/${id}`);
  return response.data;
}
