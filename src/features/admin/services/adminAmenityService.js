import api from "../../../utils/axiosInstance";

const BASE = "/admin/amenities";

export async function fetchAmenities(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`${BASE}${query ? `?${query}` : ""}`);
  return res.data.data;
}

export async function fetchGroupedAmenities(scope) {
  const res = await api.get(
    `${BASE}?grouped=true&scope=${encodeURIComponent(scope)}`
  );
  return res.data.data;
}

export async function createAmenity(payload) {
  const res = await api.post(BASE, payload);
  return res.data.data;
}

export async function updateAmenity(id, payload) {
  const res = await api.put(`${BASE}/${id}`, payload);
  return res.data.data;
}

export async function deleteAmenity(id) {
  const res = await api.delete(`${BASE}/${id}`);
  return res.data.data;
}
