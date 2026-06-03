import api from "../../../utils/partnerAxiosInstance";
import i18n from "../../../i18n";

const PARTNER_PREFIX = "/partner";

const normalizePage = (page) => ({
  items: page?.content ?? [],
  page: page?.number ?? 0,
  size: page?.size ?? 0,
  totalElements: page?.totalElements ?? 0,
  totalPages: page?.totalPages ?? 0,
  sort: page?.sort ?? null,
});

const toError = (error, fallback = i18n.t("partner.error.connection")) => {
  if (error?.response?.data) {
    const msg =
      error.response.data.message ||
      error.response.data.error ||
      fallback;
    return { success: false, message: msg };
  }
  return { success: false, message: fallback };
};

//  ME 
export const getPartnerMe = async () => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/me`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.fetch_me"));
  }
};

//  SERVICES: HOTELS 
export const listPartnerHotels = async ({ status, page = 0, size = 10 } = {}) => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/hotels`, {
      params: {
        ...(status ? { status } : {}),
        page,
        size,
      },
    });
    return { success: true, data: normalizePage(res.data?.data) };
  } catch (error) {
    return toError(error, i18n.t("partner.error.list_hotels"));
  }
};

// Lấy FULL document theo id để mở form Sửa (list dùng projection nhẹ, thiếu roomTypes/content...).
export const getPartnerHotelById = async (id) => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/hotels/${encodeURIComponent(id)}`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.list_hotels"));
  }
};

export const getPartnerRestaurantById = async (id) => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/restaurants/${encodeURIComponent(id)}`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.list_restaurants"));
  }
};

export const createPartnerHotel = async (payload) => {
  try {
    const res = await api.post(`${PARTNER_PREFIX}/hotels`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.create_hotel"));
  }
};

export const updatePartnerHotel = async (id, payload) => {
  try {
    const res = await api.put(`${PARTNER_PREFIX}/hotels/${encodeURIComponent(id)}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.update_hotel"));
  }
};

export const softDeletePartnerHotel = async (id) => {
  try {
    const res = await api.delete(`${PARTNER_PREFIX}/hotels/${encodeURIComponent(id)}`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.delete_hotel"));
  }
};

export const pausePartnerHotel = async (id) => {
  try {
    const res = await api.post(`${PARTNER_PREFIX}/hotels/${encodeURIComponent(id)}/pause`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.pause_hotel"));
  }
};

export const resumePartnerHotel = async (id) => {
  try {
    const res = await api.post(`${PARTNER_PREFIX}/hotels/${encodeURIComponent(id)}/resume`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.resume_hotel"));
  }
};

export const requestUnlockPartnerHotel = async (id, reason) => {
  try {
    const res = await api.post(
      `${PARTNER_PREFIX}/hotels/${encodeURIComponent(id)}/unlock-request`,
      { reason },
      { headers: { "Content-Type": "application/json" } }
    );
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.unlock_request_hotel"));
  }
};

//  SERVICES: RESTAURANTS 
export const listPartnerRestaurants = async ({ status, page = 0, size = 10 } = {}) => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/restaurants`, {
      params: {
        ...(status ? { status } : {}),
        page,
        size,
      },
    });
    return { success: true, data: normalizePage(res.data?.data) };
  } catch (error) {
    return toError(error, i18n.t("partner.error.list_restaurants"));
  }
};

export const createPartnerRestaurant = async (payload) => {
  try {
    const res = await api.post(`${PARTNER_PREFIX}/restaurants`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.create_restaurant"));
  }
};

export const updatePartnerRestaurant = async (id, payload) => {
  try {
    const res = await api.put(`${PARTNER_PREFIX}/restaurants/${encodeURIComponent(id)}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.update_restaurant"));
  }
};

export const softDeletePartnerRestaurant = async (id) => {
  try {
    const res = await api.delete(`${PARTNER_PREFIX}/restaurants/${encodeURIComponent(id)}`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.delete_restaurant"));
  }
};

export const pausePartnerRestaurant = async (id) => {
  try {
    const res = await api.post(`${PARTNER_PREFIX}/restaurants/${encodeURIComponent(id)}/pause`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.pause_restaurant"));
  }
};

export const resumePartnerRestaurant = async (id) => {
  try {
    const res = await api.post(`${PARTNER_PREFIX}/restaurants/${encodeURIComponent(id)}/resume`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.resume_restaurant"));
  }
};

export const requestUnlockPartnerRestaurant = async (id, reason) => {
  try {
    const res = await api.post(
      `${PARTNER_PREFIX}/restaurants/${encodeURIComponent(id)}/unlock-request`,
      { reason },
      { headers: { "Content-Type": "application/json" } }
    );
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.unlock_request_restaurant"));
  }
};

//  BOOKINGS 
export const listPartnerHotelBookings = async ({ status, page = 0, size = 10 } = {}) => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/bookings/hotels`, {
      params: { ...(status ? { status } : {}), page, size },
    });
    return { success: true, data: normalizePage(res.data?.data) };
  } catch (error) {
    return toError(error, i18n.t("partner.error.list_hotel_bookings"));
  }
};

export const getPartnerHotelBookingDetail = async (bookingCode) => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/bookings/hotels/${encodeURIComponent(bookingCode)}`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.hotel_booking_detail"));
  }
};

export const cancelPartnerHotelBooking = async (bookingCode, reason) => {
  try {
    const res = await api.post(
      `${PARTNER_PREFIX}/bookings/hotels/${encodeURIComponent(bookingCode)}/cancel`,
      { reason },
      { headers: { "Content-Type": "application/json" } }
    );
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.cancel_hotel_booking"));
  }
};

export const listPartnerRestaurantBookings = async ({ status, page = 0, size = 10 } = {}) => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/bookings/restaurants`, {
      params: { ...(status ? { status } : {}), page, size },
    });
    return { success: true, data: normalizePage(res.data?.data) };
  } catch (error) {
    return toError(error, i18n.t("partner.error.list_restaurant_bookings"));
  }
};

export const getPartnerRestaurantBookingDetail = async (bookingCode) => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/bookings/restaurants/${encodeURIComponent(bookingCode)}`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.restaurant_booking_detail"));
  }
};

export const cancelPartnerRestaurantBooking = async (bookingCode, reason) => {
  try {
    const res = await api.post(
      `${PARTNER_PREFIX}/bookings/restaurants/${encodeURIComponent(bookingCode)}/cancel`,
      { reason },
      { headers: { "Content-Type": "application/json" } }
    );
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.cancel_restaurant_booking"));
  }
};

//  STATS 
export const getPartnerStatsByStatus = async ({ from, to } = {}) => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/stats/status`, {
      params: { ...(from ? { from } : {}), ...(to ? { to } : {}) },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.stats_by_status"));
  }
};

export const getPartnerRevenue = async ({ from, to, group } = {}) => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/stats/revenue`, {
      params: {
        ...(from ? { from } : {}),
        ...(to ? { to } : {}),
        ...(group ? { group } : {}),
      },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, i18n.t("partner.error.stats_revenue"));
  }
};