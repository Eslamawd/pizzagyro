import api from "../api/axiosClient";

export async function getBalanceUser() {
  const response = await api().get("api/wallet/balance");
  if (response.status !== 200) {
    throw new Error("Failed to delete user");
  }
  return response.data;
}

export async function depositBalance(id, amount, balanceAction) {
  const response = await api().post(
    `api/admin/wallet/${balanceAction}/${id}`,
    amount
  );
  if (response.status !== 200) {
    throw new Error("Failed to delete user");
  }
  return response.data;
}
export async function addBalanceByUser(amount) {
  const response = await api().post(`api/payment/create`, amount);
  if (response.status !== 200) {
    throw new Error("Failed to delete user");
  }
  return response.data;
}

export async function addBalanceBanking(payload) {
  const response = await api().post(`api/payment/banking`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  if (response.status !== 200) {
    throw new Error("Failed to delete user");
  }
  return response.data;
}

export async function changeStatus(paymentId, status) {
  const response = await api().put(
    `api/admin/payments/${paymentId}/status`,
    status
  );
  if (response.status !== 200) {
    throw new Error("Failed to change payment status");
  }
  return response.data;
}
export async function loadAllPayments(page = 1) {
  const response = await api().get(`api/admin/payments?page=${page}`);
  if (response.status !== 200) {
    throw new Error("Failed to fetch payments");
  }
  return response.data;
}
