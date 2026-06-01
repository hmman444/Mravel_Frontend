// src/features/user/services/blockService.js
import api from "../../../utils/axiosInstance";

const BASE = "/users/friends";

/** Danh sách người mình đã chặn. */
export async function getBlockedUsers() {
  const res = await api.get(`${BASE}/blocked`);
  return res.data?.data || [];
}

/** Chặn một người (Facebook-style, vô hình hai chiều). */
export async function blockUser(targetId) {
  const res = await api.post(`${BASE}/block/${targetId}`);
  return res.data?.data;
}

/** Bỏ chặn (KHÔNG khôi phục bạn bè). */
export async function unblockUser(targetId) {
  const res = await api.delete(`${BASE}/block/${targetId}`);
  return res.data?.data;
}

/** Kiểm tra trạng thái chặn 2 chiều với target. */
export async function isBlockedWith(targetId) {
  const res = await api.get(`${BASE}/block-status?targetId=${targetId}`);
  return res.data?.data === true;
}
