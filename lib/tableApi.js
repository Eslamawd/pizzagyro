// src/lib/tableApi.js

import api from "../api/axiosClient";

/**
 * GET /api/table
 */

// GET /api/table/{id}
export async function getTable(id) {
  const response = await api().get(`api/tables/${id}`);
  // نفترض أنّ الـ response.data هو مصفوفة الخدمات
  return response.data;
}

/**
 * POST /api/table
 * @param tableData: جسم الطلب بصيغة Table (object)
 */
export async function addNewTable(tableData) {
  try {
    const response = await api().post("api/tables", tableData);
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
 * PUT /api/table/{id}
 * @param tableData: كائن الخدمة يحتوي على id وحقول أخرى محدثة
 */
export async function updateTable(id, paylotable) {
  const response = await api().patch(`api/tables/${id}`, paylotable);
  return response.data;
}

/**
 * DELETE /api/table/{id}
 */
export async function deleteTable(id) {
  const response = await api().delete(`api/tables/${id}`);
  return response.data;
}
