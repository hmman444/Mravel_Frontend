// src/features/catalog/services/catalogService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const CATALOG_PREFIX = `${API_URL}/catalog`;
const PLACES_PREFIX = `${CATALOG_PREFIX}/places`;
const HOTELS_PREFIX = `${CATALOG_PREFIX}/hotels`;

const normalizePage = (page) => ({
  items: page?.content ?? [],
  page: page?.number ?? 0,
  size: page?.size ?? 0,
  totalElements: page?.totalElements ?? 0,
  totalPages: page?.totalPages ?? 0,
  sort: page?.sort ?? null,
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

/* =====================================================================
 *                           HOTELS (BACKEND MỚI)
 * ===================================================================*/

/**
 * POST /api/catalog/hotels/search?page=&size=&sort=
 * Body: { location, checkIn, checkOut, adults, children, rooms }
 */
export const getHotels = async (params = {}) => {
  try {
    const {
      page = 0,
      size = 9,
      sort,
      childrenAges: CHILDREN_AGES_UNUSED, // FE-only, không gửi lên backend
      ...searchBody
    } = params || {};

    // nếu tất cả field trong body đều rỗng → vẫn gửi {}
    const hasBody = Object.values(searchBody).some(
      (v) => v !== undefined && v !== null && v !== ""
    );

    const body = hasBody ? searchBody : {};

    const res = await axios.post(
      `${HOTELS_PREFIX}/search`,
      body,
      {
        params: {
          page,
          size,
          ...(sort ? { sort } : {}),
        },
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const pageData = res.data?.data; // ApiResponse.data = Page<HotelSummaryDTO>
    return { success: true, data: normalizePage(pageData) };
  } catch (error) {
    console.error("getHotels error:", error?.response || error);
    return toError(error, "Lỗi tìm kiếm khách sạn");
  }
};

/** GET /api/catalog/hotels/{slug} */
export const getHotelDetail = async (slug) => {
  try {
    const res = await axios.get(
      `${HOTELS_PREFIX}/${encodeURIComponent(slug)}`
    );
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Không tải được chi tiết khách sạn");
  }
};

/* =====================================================================
 *                    RESTAURANTS & PLACES (giữ như cũ)
 * ===================================================================*/

/** GET /catalog/places/restaurants */
export const getRestaurants = async (params = {}) => {
  try {
    const res = await axios.get(`${PLACES_PREFIX}/restaurants`, { params });
    return { success: true, data: normalizePage(res.data) };
  } catch (error) {
    return toError(error, "Lỗi tải danh sách quán ăn");
  }
};

/** GET /catalog/places/poi */
export const getPlaces = async (params = {}) => {
  try {
    const res = await axios.get(`${PLACES_PREFIX}/poi`, { params });
    return { success: true, data: normalizePage(res.data) };
  } catch (error) {
    return toError(error, "Lỗi tải danh sách địa điểm");
  }
};

/** GET /catalog/places/poi (suggest) */
export const suggestPlaces = async (q, limit = 6) => {
  try {
    const res = await axios.get(`${PLACES_PREFIX}/poi`, {
      params: { q, page: 0, size: limit },
    });
    return { success: true, data: res.data?.content ?? [] };
  } catch (error) {
    return toError(error, "Lỗi gợi ý địa điểm");
  }
};

/** GET /catalog/places/{slug} */
export const getPlaceDetail = async (slug) => {
  try {
    const res = await axios.get(
      `${PLACES_PREFIX}/${encodeURIComponent(slug)}`
    );
    return { success: true, data: res.data };
  } catch (error) {
    return toError(error, "Không tìm thấy địa điểm");
  }
};

export const getChildren = async (slug, params = {}, options = {}) => {
  try {
    const res = await axios.get(
      `${PLACES_PREFIX}/${encodeURIComponent(slug)}/children`,
      { params, signal: options.signal }
    );
    return { success: true, data: normalizePage(res.data) };
  } catch (error) {
    return toError(error, "Lỗi tải danh sách con");
  }
};