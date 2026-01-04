// src/lib/orderApi.js

import api from "../api/axiosClient";

/**
 * GET /api/order
 */

// GET /api/order/{id}
export async function getOrder(id) {
  const response = await api().get(`api/orders/${id}`);
  // نفترض أنّ الـ response.data هو مصفوفة الخدمات
  return response.data;
}

export async function getOrdersByKitchen(
  kitchen,
  restaurant_id,
  user_id,
  token
) {
  try {
    const response = await api().get("api/orders/kitchen", {
      params: {
        kitchen,
        restaurant: restaurant_id,
        user: user_id,
        token: token,
      },
    });
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
export async function getOrdersByCashier(
  cashier,
  restaurant_id,
  user_id,
  token
) {
  try {
    const response = await api().get("api/orders/cashier", {
      params: {
        cashier,
        restaurant: restaurant_id,
        user: user_id,
        token: token,
      },
    });
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
export async function getOrderByUser(order_id, restaurant_id, user_id, token) {
  try {
    const response = await api().get(`api/orders/${order_id}/user`, {
      params: {
        restaurant: restaurant_id,
        user: user_id,
        token: token,
      },
    });
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

export async function updateOrderByKitchen(
  orderId,
  kitchen,
  restaurant_id,
  user_id,
  token,
  state
) {
  const response = await api().patch(`api/orders/${orderId}/kitchen`, state, {
    params: {
      kitchen,
      restaurant: restaurant_id,
      user: user_id,
      token: token,
    },
  });
  return response.data;
}

export async function updateOrderByCashier(
  orderId,
  cashier,
  restaurant_id,
  user_id,
  token,
  state
) {
  const response = await api().patch(`api/orders/${orderId}/cashier`, state, {
    params: {
      cashier,
      restaurant: restaurant_id,
      user: user_id,
      token: token,
    },
  });
  return response.data;
}

/**
 * POST /api/order
 * @param orderData: جسم الطلب بصيغة Order (object)
 */
export async function addNewOrder(orderData, restaurant_id, user_id, token) {
  // لا حاجة لتمرير الـ id، Laravel سيولّد id تلقائيًا (بما أننا استخدمنا auto-increment)

  const response = await api().post("api/orders", orderData, {
    params: {
      restaurant: restaurant_id,
      user: user_id,
      token: token,
    },
  });
  return response.data;
}

export async function addNewOrderDelivery(orderData) {
  const response = await api().post("api/orders/delivry", orderData);
  return response.data;
}

/**
 * PUT /api/order/{id}
 * @param orderData: كائن الخدمة يحتوي على id وحقول أخرى محدثة
 */
export async function updateOrder(id, payloorder) {
  const response = await api().post(`api/orders/${id}`, payloorder);
  return response.data;
}

/**
 * DELETE /api/order/{id}
 */
export async function deleteOrder(id) {
  const response = await api().delete(`api/orders/${id}`);
  return response.data;
}

export async function getOrdersDelivery() {
  const response = await api().get("api/orders");
  return response.data;
}
