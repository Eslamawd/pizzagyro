// src/lib/categoryApi.js

import api from "../api/axiosClient";

/**
 * GET /api/category
 */

// GET /api/category/{id}
export async function getCategory(id) {
  const response = await api().get(`api/categories/${id}`);
  // نفترض أنّ الـ response.data هو مصفوفة الخدمات
  return response.data;
}

/**
 * POST /api/category
 * @param categoryData: جسم الطلب بصيغة Category (object)
 */
export async function addNewCategory(categoryData) {
  // لا حاجة لتمرير الـ id، Laravel سيولّد id تلقائيًا (بما أننا استخدمنا auto-increment)

  const response = await api().post("api/categories", categoryData);
  return response.data;
}

/**
 * PUT /api/category/{id}
 * @param categoryData: كائن الخدمة يحتوي على id وحقول أخرى محدثة
 */
export async function updateCategory(id, paylocategory) {
  const response = await api().patch(`api/categories/${id}`, paylocategory);
  return response.data;
}

/**
 * DELETE /api/category/{id}
 */
export async function deleteCategory(id) {
  const response = await api().delete(`api/categories/${id}`);
  return response.data;
}
