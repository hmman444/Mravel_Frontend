import api from "../../../utils/axiosInstance";

const BASE = "/notifications"; // axiosInstance đã có baseURL gateway hoặc trực tiếp

const ensureOk = (res) => {
  const body = res?.data;
  if (body?.success === false) {
    const msg = body?.message || "Có lỗi xảy ra";
    const err = new Error(msg);
    err.response = { data: body, status: res?.status };
    throw err;
  }
  return body?.data;
};

const toQuery = (params = {}) => {
  const clean = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    clean[k] = v;
  });
  return new URLSearchParams(clean).toString();
};

export async function fetchNotifications(params = {}) {
  const query = toQuery(params);
  const res = await api.get(`${BASE}${query ? `?${query}` : ""}`);
  return ensureOk(res);
}
export async function markNotificationRead(id, params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await api.patch(`${BASE}/${id}/read${query ? `?${query}` : ""}`);
  return ensureOk(res); // BE trả unreadCount (Long)
}

export async function markAllNotificationsRead(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await api.patch(`${BASE}/read-all${query ? `?${query}` : ""}`);
  return ensureOk(res); // unreadCount
}
