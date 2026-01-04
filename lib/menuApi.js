// src/lib/menuApi.js

import api from "../api/axiosClient";

/**
 * GET /api/menu
 */
export async function getMenus() {
  const response = await api().get("api/menus");
  return response.data;
}

// GET /api/menu/{id}
export async function getMenu(id) {
  const response = await api().get(`api/menus/${id}`);
  // نفترض أنّ الـ response.data هو مصفوفة الخدمات
  return response.data;
}

/**
 * POST /api/menu
 * @param menuData: جسم الطلب بصيغة Menu (object)
 */
export async function addNewMenu(menuData) {
  // لا حاجة لتمرير الـ id، Laravel سيولّد id تلقائيًا (بما أننا استخدمنا auto-increment)

  const response = await api().post("api/menus", menuData);
  return response.data;
}

/**
 * PUT /api/menu/{id}
 * @param menuData: كائن الخدمة يحتوي على id وحقول أخرى محدثة
 */
export async function updateMenu(id, paylomenu) {
  const response = await api().post(`api/menus/${id}`, paylomenu, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * DELETE /api/menu/{id}
 */
export async function deleteMenu(id) {
  const response = await api().delete(`api/menus/${id}`);
  return response.data;
}
