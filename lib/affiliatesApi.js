import api from "../api/axiosClient";

export async function getAffiliates(page) {
  const response = await api().get(`api/affiliates?page=${page || 1}`);
  return response.data;
}

export async function getsubscribeByAdmin(page) {
  const response = await api().get(`api/admin/affiliates?page=${page || 1}`);
  return response.data;
}
