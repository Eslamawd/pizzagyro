import api from "../api/axiosClient";

export async function getWithdraw(page) {
  const response = await api().get(`api/withdraw?page=${page || 1}`);
  return response.data;
}
export async function createWithdraw(payload) {
  const response = await api().post(`api/withdraw`, payload);
  return response.data;
}

export async function getWithdrawByAdmin(page) {
  const response = await api().get(
    `api/admin/withdraw-payments?page=${page || 1}`
  );
  return response.data;
}
export async function updateStatusWithdraw(id, payload) {
  const response = await api().patch(
    `api/admin/withdraw-payments/${id}/status`,
    payload
  );
  return response.data;
}
