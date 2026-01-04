// src/lib/adApi.js

import api from "../api/axiosClient";

/**
 * GET /api/planSub
 */
export async function loadPlanSub(page) {
  const response = await api().get(`api/plan-subscripes?page=${page || 1}`);
  // نفترض أنّ الـ response.data هو مصفوفة الخدمات
  return response.data;
}

// GET /api/admin/planSub
export async function loadPlanSubByAdmin(page) {
  const response = await api().get(
    `api/admin/plan-subscripes?page=${page || 1}`
  );
  // نفترض أنّ الـ response.data هو مصفوفة الخدمات
  return response.data;
}

/**
 * POST /api/planSub
 * @param adData: جسم الطلب بصيغة Ad (object)
 */
export async function addNewPlanSub(planSubData) {
  // لا حاجة لتمرير الـ id، Laravel سيولّد id تلقائيًا (بما أننا استخدمنا auto-increment)

  const response = await api().post("api/admin/plan-subscripes", planSubData);
  return response.data;
}

/**
 * PUT /api/planSub/{id}
 * @param adData: كائن الخدمة يحتوي على id وحقول أخرى محدثة
 */
export async function updatePlanSub(id, payload) {
  const response = await api().put(`api/admin/plan-subscripes/${id}`, payload);
  return response.data;
}

/**
 * DELETE /api/admin/plan-subscripes/{id}
 */
export async function deletePlanSub(id) {
  const response = await api().delete(`api/admin/plan-subscripes/${id}`);
  return response.data;
}
