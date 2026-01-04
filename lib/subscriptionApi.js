import api from "../api/axiosClient";

export async function renewSubscriptionAPI(subId) {
  try {
    const response = await api().post(`api/subscriptions/${subId}`);
    return response.data;
  } catch (error) {
    if (error.response?.status === 403) {
      return {
        error: true,
        message: error.response.data?.message || "Unauthorized",
      };
    }
    throw error;
  }
}

export async function getsubscribeByAdmin(page) {
  const response = await api().get(`api/admin/subscriptions?page=${page || 1}`);
  return response.data;
}
export async function getsubscribeByUser(page) {
  const response = await api().get(`api/subscriptions?page=${page || 1}`);
  return response.data;
}

export async function getAllSubCount() {
  const response = await api().get("api/admin/subscriptions/count");
  if (response.status !== 200) {
    throw new Error("Failed to fetch order count");
  }
  return response.data;
}
export async function getRevnueSub() {
  const response = await api().get("api/admin/subscriptions/revenue");
  if (response.status !== 200) {
    throw new Error("Failed to fetch order count");
  }
  return response.data;
}
