// src/features/catalog/services/catalogService.js
import api from "../../../utils/axiosInstance";

const CATALOG_PREFIX = "/catalog";
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

    const hasBody = Object.values(searchBody).some(
      (v) => v !== undefined && v !== null && v !== ""
    );
    const body = hasBody ? searchBody : {};

    const res = await api.post(
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

    // ApiResponse.data = Page<HotelSummaryDTO>
    const pageData = res.data?.data;
    return { success: true, data: normalizePage(pageData) };
  } catch (error) {
    console.error("getHotels error:", error?.response || error);
    return toError(error, "Lỗi tìm kiếm khách sạn");
  }
};

/** GET /api/catalog/hotels/{slug} */
export const getHotelDetail = async (slug, options = {}) => {
  try {
    const { includeInactive = false } = options || {};
    const res = await api.get(`${HOTELS_PREFIX}/${encodeURIComponent(slug)}`, {
      params: includeInactive ? { includeInactive: true } : {},
    });
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

    const hasBody = Object.values(searchBody).some(
      (v) => v !== undefined && v !== null && v !== ""
    );
    const body = hasBody ? searchBody : {};

    const res = await api.post(
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
export const getRestaurantDetail = async (slug, options = {}) => {
  try {
    const { includeInactive = false } = options || {};
    const res = await api.get(`${RESTAURANTS_PREFIX}/${encodeURIComponent(slug)}`, {
      params: includeInactive ? { includeInactive: true } : {},
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Không tải được chi tiết quán ăn");
  }
};

/**
 * TÌM NHÀ HÀNG (POST)
 * POST /api/catalog/restaurants/search?page=&size=
 * Trả về đúng { message, data: Page<RestaurantSummaryDTO>, ... } như cũ
 */
export async function searchRestaurants({
  location,
  visitDate,
  visitTime,
  people,
  cuisineSlugs,
  page = 0,
  size = 9,
}) {
  try {
    const body = {
      ...(location ? { location } : {}),
      ...(visitDate ? { visitDate } : {}),
      ...(visitTime ? { visitTime } : {}),
      ...(people ? { people } : {}),
      ...(Array.isArray(cuisineSlugs) && cuisineSlugs.length
        ? { cuisineSlugs }
        : {}),
    };

    const res = await api.post(
      `${RESTAURANTS_PREFIX}/search`,
      body,
      {
        params: { page, size },
        headers: { "Content-Type": "application/json" },
      }
    );

    // Giữ nguyên format cũ: res.data (ApiResponse)
    return res.data;
  } catch (error) {
    console.error("searchRestaurants error:", error?.response || error);
    // Trả về format giống các hàm khác để slice xử lý
    return toError(error, "Lỗi tìm kiếm quán ăn");
  }
}

/** GET /catalog/places/poi */
export const getPlaces = async (params = {}) => {
  try {
    const res = await api.get(`${PLACES_PREFIX}/poi`, { params });

    // NEW: ApiResponse.data = Page<PlaceSummaryDTO>
    const pageData = res.data?.data;
    return { success: true, data: normalizePage(pageData) };
  } catch (error) {
    return toError(error, "Lỗi tải danh sách địa điểm");
  }
};

/** GET /catalog/places/poi (suggest) */
export const suggestPlaces = async (q, limit = 6) => {
  try {
    const res = await api.get(`${PLACES_PREFIX}/poi`, {
      params: { q, page: 0, size: limit },
    });

    // NEW: ApiResponse.data = Page => lấy content
    const pageData = res.data?.data;
    return { success: true, data: pageData?.content ?? [] };
  } catch (error) {
    return toError(error, "Lỗi gợi ý địa điểm");
  }
};

/** GET /catalog/places/{slug} */
export const getPlaceDetail = async (slug) => {
  try {
    const res = await api.get(`${PLACES_PREFIX}/${encodeURIComponent(slug)}`);

    // NEW: ApiResponse.data = PlaceDetailDTO
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Không tìm thấy địa điểm");
  }
};

/** GET /catalog/geo/suggest?q=&limit=  (gợi ý kiểu Google) */
export const suggestGeoLocations = async (q, limit = 6) => {
  try {
    const res = await api.get(`${GEO_PREFIX}/suggest`, {
      params: { q, limit },
    });
    // BE trả List<LocationSuggestDTO> -> res.data là mảng
    return { success: true, data: res.data ?? [] };
  } catch (error) {
    return toError(error, "Lỗi gợi ý vị trí ngoài hệ thống");
  }
};

export const getChildren = async (slug, params = {}, options = {}) => {
  try {
    const res = await api.get(
      `${PLACES_PREFIX}/${encodeURIComponent(slug)}/children`,
      { params, signal: options.signal }
    );

    // NEW: ApiResponse.data = Page<PlaceSummaryDTO>
    const pageData = res.data?.data;
    return { success: true, data: normalizePage(pageData) };
  } catch (error) {
    return toError(error, "Lỗi tải danh sách con");
  }
};