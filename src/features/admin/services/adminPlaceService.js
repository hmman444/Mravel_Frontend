import api from "../../../utils/axiosInstance";

const BASE = "/admin/places";

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

// normalize Page (Spring Page)
const normalizePage = (page) => ({
  items: page?.content ?? [],
  page: page?.number ?? 0,
  size: page?.size ?? 0,
  totalElements: page?.totalElements ?? 0,
  totalPages: page?.totalPages ?? 0,
  sort: page?.sort ?? null,
});

export async function createAdminPlace(payload) {
  const res = await api.post(`${BASE}`, payload);
  return ensureOk(res);
}

export async function fetchAdminPlaces(params = {}) {
  const res = await api.get(BASE, { params });
  const pageData = ensureOk(res);
  return normalizePage(pageData);
}

export async function fetchAdminPlaceDetail(slug) {
  const res = await api.get(`${BASE}/${encodeURIComponent(slug)}`);
  return ensureOk(res);
}

export async function fetchAdminChildren(slug, params = {}) {
  const res = await api.get(`${BASE}/${encodeURIComponent(slug)}/children`, {
    params,
  });
  const pageData = ensureOk(res);
  return normalizePage(pageData);
}

export async function updateAdminPlace(id, payload) {
  const res = await api.put(`${BASE}/${id}`, payload);
  return ensureOk(res);
}

export async function deleteAdminPlace(id) {
  const res = await api.delete(`${BASE}/${id}`);
  return ensureOk(res);
}
