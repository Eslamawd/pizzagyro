// src/lib/restaurantApi.js

import api from "../api/axiosClient";

/**
 * GET /api/restaurants
 */
export async function loadRestaurants(page) {
  const response = await api().get(`api/restaurants?page=${page || 1}`);
  // نفترض أنّ الـ response.data هو مصفوفة الخدمات
  return response.data;
}

export async function loadAllData() {
  const response = await api().get(`api/restaurants/all/data`);
  // نفترض أنّ الـ response.data هو مصفوفة الخدمات
  return response.data;
}

// GET /api/restaurantmin/restaurants
export async function loadRestaurantsByAdmin(page, userId) {
  const response = await api().get(
    `api/admin/restaurants?page=${page || 1}&user=${userId}`
  );
  // نفترض أنّ الـ response.data هو مصفوفة الخدمات
  return response.data;
}

// GET /api/restaurants/{id}
export async function getRestaurant(id) {
  const response = await api().get(`api/restaurants/${id}`);
  // نفترض أنّ الـ response.data هو مصفوفة الخدمات
  return response.data;
}
// GET /api/restaurants/{id}/user
export async function getRestaurantWithUser(restaurant_id, user_id, token) {
  try {
    const response = await api().get(`api/restaurants/${restaurant_id}/user`, {
      params: {
        restaurant: restaurant_id,
        user: user_id,
        token: token,
      },
    });
    // نفترض أنّ الـ response.data هو مصفوفة الخدمات
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      return {
        active: false,
        message: error.response.data?.message || "Subscription expired",
      };
    }
    throw error;
  }
}

/**
 * POST /api/restaurants
 * @param restaurantData: جسم الطلب بصيغة Restaurant (object)
 */
export async function addNewRestaurant(restaurantData) {
  // لا حاجة لتمرير الـ id، Laravel سيولّد id تلقائيًا (بما أننا استخدمنا auto-increment)
  try {
    const response = await api().post("api/restaurants", restaurantData);
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

export async function linksRestaurant(linksData) {
  // لا حاجة لتمرير الـ id، Laravel سيولّد id تلقائيًا (بما أننا استخدمنا auto-increment)
  try {
    const response = await api().post("api/restaurants/links", linksData);
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
 * PUT /api/restaurants/{id}
 * @param restaurantData: كائن الخدمة يحتوي على id وحقول أخرى محدثة
 */
export async function updateRestaurant(id, paylorestaurant) {
  const response = await api().post(`api/restaurants/${id}`, paylorestaurant, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
}

/**
 * DELETE /api/restaurants/{id}
 */
export async function deleteRestaurant(id) {
  const response = await api().delete(`api/restaurants/${id}`);
  return response.data;
}

/** * GET /api/restaurants/{id}/orders */
export async function getRestaurantOrders(id, status, page) {
  const params = new URLSearchParams();

  if (status?.state) params.append("state", status.state);
  if (page) params.append("page", page);

  const response = await api().get(
    `api/restaurants/${id}/orders?${params.toString()}`
  );
  return response.data;
}
export async function getRestaurantOrdersAdmin(id, status, page) {
  const params = new URLSearchParams();

  if (status?.state) params.append("state", status.state);
  if (page) params.append("page", page);

  const response = await api().get(
    `api/admin/restaurants/${id}/orders?${params.toString()}`
  );
  return response.data;
}
