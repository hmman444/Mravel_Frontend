import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const PREFIX = `${API_URL}/catalog/places`;

const normalizePage = (data) => ({
  items: data?.content ?? [],
  page: data?.number ?? 0,
  size: data?.size ?? 0,
  totalElements: data?.totalElements ?? 0,
  totalPages: data?.totalPages ?? 0,
  sort: data?.sort ?? null,
});

const toError = (error, fallback = "Lỗi kết nối đến server") => {
  if (error?.response?.data) {
    const msg =
      error.response.data.message ||
      error.response.data.error ||
      fallback;
    return { success: false, message: msg };
  }
  return { success: false, message: fallback };
};

/** GET /hotels */
export const getHotels = async (params = {}) => {
  try {
    const res = await axios.get(`${PREFIX}/hotels`, { params });
    return { success: true, data: normalizePage(res.data) };
  } catch (error) {
    return toError(error);
  }
};

/** GET /restaurants (cuisineSlugs có thể là string hoặc string[]) */
export const getRestaurants = async (params = {}) => {
  try {
    const res = await axios.get(`${PREFIX}/restaurants`, { params });
    return { success: true, data: normalizePage(res.data) };
  } catch (error) {
    return toError(error);
  }
};

/** GET /poi */
export const getPlaces = async (params = {}) => {
  try {
    const res = await axios.get(`${PREFIX}/poi`, { params });
    return { success: true, data: normalizePage(res.data) };
  } catch (error) {
    return toError(error);
  }
};

/** GET /poi (suggest) */
export const suggestPlaces = async (q, limit = 6) => {
  try {
    const res = await axios.get(`${PREFIX}/poi`, { params: { q, page: 0, size: limit } });
    return { success: true, data: (res.data?.content ?? []) };
  } catch (error) {
    return toError(error);
  }
};

/** GET /{slug} */
export const getPlaceDetail = async (slug) => {
  try {
    const res = await axios.get(`${PREFIX}/${encodeURIComponent(slug)}`);
    return { success: true, data: res.data };
  } catch (error) {
    return toError(error);
  }
};

export const getChildren = async (slug, params = {}, options = {}) => {
  try {
    const res = await axios.get(
      `${PREFIX}/${encodeURIComponent(slug)}/children`,
      { params, signal: options.signal }
    );
    return { success: true, data: normalizePage(res.data) };
  } catch (error) {
    return toError(error);
  }
};