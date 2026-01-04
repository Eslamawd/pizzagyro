// src/lib/OptionApi.js

import api from "../api/axiosClient";

// GET /api/Options/{id}
export async function getOption(id) {
  const response = await api().get(`api/Options/${id}`);
  // نفترض أنّ الـ response.data هو مصفوفة الخدمات
  return response.data;
}

/**
 * POST /api/Options
 * @param OptionData: جسم الطلب بصيغة Option (object)
 */
export async function addNewOption(OptionData) {
  // لا حاجة لتمرير الـ id، Laravel سيولّد id تلقائيًا (بما أننا استخدمنا auto-increment)

  const response = await api().post("api/item-options", OptionData);
  return response.data;
}

/**
 * PUT /api/item-options/{id}
 * @param OptionData: كائن الخدمة يحتوي على id وحقول أخرى محدثة
 */
export async function updateOption(id, OptionData) {
  const response = await api().put(`api/item-options/${id}`, OptionData);
  return response.data;
}

/**
 * DELETE /api/item-options/{id}
 */
export async function deleteOption(id) {
  const response = await api().delete(`api/item-options/${id}`);
  return response.data;
}
