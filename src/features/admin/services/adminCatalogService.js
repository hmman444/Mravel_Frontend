import api from "../../../utils/axiosInstance";

const BASE = "/admin/catalog";

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

export async function fetchAdminHotelById(id) {
  const res = await api.get(`${BASE}/hotels/${id}`);
  return ensureOk(res);
}

/* ===================== LIST ===================== */
export async function fetchAdminHotels(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`${BASE}/hotels${query ? `?${query}` : ""}`);
  return ensureOk(res);
}

export async function fetchAdminRestaurants(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`${BASE}/restaurants${query ? `?${query}` : ""}`);
  return ensureOk(res);
}

/* ===================== ACTIONS (adminId lấy từ token ở admin-service) ===================== */
export async function approveHotel(id) {
  const res = await api.post(`${BASE}/hotels/${id}:approve`);
  return ensureOk(res);
}

export async function rejectHotel(id, reason) {
  const res = await api.post(`${BASE}/hotels/${id}:reject`, { reason });
  return ensureOk(res);
}

export async function blockHotel(id, reason) {
  const res = await api.post(`${BASE}/hotels/${id}:block`, { reason });
  return ensureOk(res);
}

export async function unblockHotel(id) {
  const res = await api.post(`${BASE}/hotels/${id}:unblock`);
  return ensureOk(res);
}

export async function approveRestaurant(id) {
  const res = await api.post(`${BASE}/restaurants/${id}:approve`);
  return ensureOk(res);
}

export async function rejectRestaurant(id, reason) {
  const res = await api.post(`${BASE}/restaurants/${id}:reject`, { reason });
  return ensureOk(res);
}

export async function blockRestaurant(id, reason) {
  const res = await api.post(`${BASE}/restaurants/${id}:block`, { reason });
  return ensureOk(res);
}

export async function unblockRestaurant(id) {
  const res = await api.post(`${BASE}/restaurants/${id}:unblock`);
  return ensureOk(res);
}
