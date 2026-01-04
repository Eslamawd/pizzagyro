import api from "../api/axiosClient";

export async function createDelivery(formData) {
  const response = await api().post(`/api/deliveries`, formData);
  return response.data;
}

export async function getDeliveries(page = 1) {
  const response = await api().get(`/api/deliveries?page=${page}`);
  return response.data;
}

export async function getDeliveryById(id) {
  const response = await api().get(`/api/deliveries/${id}`);
  return response.data;
}
export async function updateDelivery(id, formData) {
  const response = await api().put(`/api/deliveries/${id}`, formData);
  return response.data;
}
