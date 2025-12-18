import api from "../../../utils/axiosInstance";

const BASE = "/admin/amenities";

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

export async function createAmenity(payload) {
  const res = await api.post(BASE, payload);
  return ensureOk(res);
}

export async function updateAmenity(id, payload) {
  const res = await api.put(`${BASE}/${id}`, payload);
  return ensureOk(res);
}

export async function deleteAmenity(id) {
  const res = await api.delete(`${BASE}/${id}`);
  return ensureOk(res);
}

export async function fetchAmenities(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`${BASE}${query ? `?${query}` : ""}`);
  return ensureOk(res);
}

export async function fetchGroupedAmenities(scope) {
  const res = await api.get(`${BASE}?grouped=true&scope=${encodeURIComponent(scope)}`);
  return ensureOk(res);
}
