// src/features/catalog/services/catalogService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const CATALOG_PREFIX = `${API_URL}/catalog`;
const PLACES_PREFIX = `${CATALOG_PREFIX}/places`;
const HOTELS_PREFIX = `${CATALOG_PREFIX}/hotels`;
const RESTAURANTS_PREFIX = `${CATALOG_PREFIX}/restaurants`;
const GEO_PREFIX = `${CATALOG_PREFIX}/geo`;
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

/** 
 * POST /api/catalog/restaurants/search?page=&size=&sort=
 * Body: { location, cuisineSlugs, date, time, people, ... }
 */
export const getRestaurants = async (params = {}) => {
  try {
    const {
      page = 0,
      size = 9,
      sort,
      ...searchBody
    } = params || {};

    // nếu tất cả field trong body đều rỗng → vẫn gửi {}
    const hasBody = Object.values(searchBody).some(
      (v) => v !== undefined && v !== null && v !== ""
    );
    const body = hasBody ? searchBody : {};

    const res = await axios.post(
      `${RESTAURANTS_PREFIX}/search`,
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

    // Nếu backend dùng ApiResponse giống hotels: { data: Page<RestaurantSummaryDTO> }
    const pageData = res.data?.data ?? res.data;
    return { success: true, data: normalizePage(pageData) };
  } catch (error) {
    console.error("getRestaurants error:", error?.response || error);
    return toError(error, "Lỗi tìm kiếm quán ăn");
  }
};

/** GET /api/catalog/restaurants/{slug} */
export const getRestaurantDetail = async (slug) => {
  try {
    const res = await axios.get(
      `${RESTAURANTS_PREFIX}/${encodeURIComponent(slug)}`
    );
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Không tải được chi tiết quán ăn");
  }
};

// TÌM NHÀ HÀNG (POST)
export async function searchRestaurants({ location, visitDate, visitTime, people, cuisineSlugs, page=0, size=9 }) {
  const url = `${API_URL}/catalog/restaurants/search?page=${page}&size=${size}`;
  // Nếu bạn không có gì lọc thêm, vẫn gửi {}
  const body = {
    ...(location ? { location } : {}),
    ...(visitDate ? { visitDate } : {}),
    ...(visitTime ? { visitTime } : {}),
    ...(people ? { people } : {}),
    ...(Array.isArray(cuisineSlugs) && cuisineSlugs.length ? { cuisineSlugs } : {}),
  };
  const res = await axios.post(url, body, { headers: { "Content-Type": "application/json" } });
  return res.data; // { message, data: Page<RestaurantSummaryDTO>, ... }
}

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

/** GET /catalog/geo/suggest?q=&limit=  (gợi ý kiểu Google) */
export const suggestGeoLocations = async (q, limit = 6) => {
  try {
    const res = await axios.get(`${GEO_PREFIX}/suggest`, {
      params: { q, limit },
    });
    // BE trả List<LocationSuggestDTO> -> res.data là mảng
    return { success: true, data: res.data ?? [] };
  } catch (error) {
    return toError(error, "Lỗi gợi ý vị trí ngoài hệ thống");
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