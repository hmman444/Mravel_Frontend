// src/features/admin/services/adminUserService.js
import api from "../../../utils/axiosInstance";
import i18n from "../../../i18n";

const BASE = "/auth/users";

const ensureOk = (res) => {
  const body = res?.data;
  if (body?.success === false) {
    const msg = body?.message || i18n.t("admin.error_generic");
    const err = new Error(msg);
    err.response = { data: body, status: res?.status };
    throw err;
  }
  return body?.data;
};

export async function fetchAdminUsers(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`${BASE}${query ? `?${query}` : ""}`);
  return ensureOk(res);
}

export async function lockUser(id) {
  const res = await api.patch(`${BASE}/${id}/lock`);
  return ensureOk(res);
}

export async function unlockUser(id) {
  const res = await api.patch(`${BASE}/${id}/unlock`);
  return ensureOk(res);
}
