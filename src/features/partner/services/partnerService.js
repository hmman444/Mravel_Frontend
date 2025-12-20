import api from "../../../utils/partnerAxiosInstance";

const PARTNER_PREFIX = "/partner";

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

// ===== ME =====
export const getPartnerMe = async () => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/me`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Không lấy được thông tin đối tác");
  }
};

// ===== SERVICES: HOTELS =====
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
    return toError(error, "Không tải được danh sách khách sạn");
  }
};

export const createPartnerHotel = async (payload) => {
  try {
    const res = await api.post(`${PARTNER_PREFIX}/hotels`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Tạo khách sạn thất bại");
  }
};

export const updatePartnerHotel = async (id, payload) => {
  try {
    const res = await api.put(`${PARTNER_PREFIX}/hotels/${encodeURIComponent(id)}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Cập nhật khách sạn thất bại");
  }
};

export const softDeletePartnerHotel = async (id) => {
  try {
    const res = await api.delete(`${PARTNER_PREFIX}/hotels/${encodeURIComponent(id)}`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Xóa khách sạn thất bại");
  }
};

export const pausePartnerHotel = async (id) => {
  try {
    const res = await api.post(`${PARTNER_PREFIX}/hotels/${encodeURIComponent(id)}/pause`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Tạm khóa khách sạn thất bại");
  }
};

export const resumePartnerHotel = async (id) => {
  try {
    const res = await api.post(`${PARTNER_PREFIX}/hotels/${encodeURIComponent(id)}/resume`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Mở lại khách sạn thất bại");
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
    return toError(error, "Gửi yêu cầu mở khóa khách sạn thất bại");
  }
};

// ===== SERVICES: RESTAURANTS =====
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
    return toError(error, "Không tải được danh sách quán ăn");
  }
};

export const createPartnerRestaurant = async (payload) => {
  try {
    const res = await api.post(`${PARTNER_PREFIX}/restaurants`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Tạo quán ăn thất bại");
  }
};

export const updatePartnerRestaurant = async (id, payload) => {
  try {
    const res = await api.put(`${PARTNER_PREFIX}/restaurants/${encodeURIComponent(id)}`, payload, {
      headers: { "Content-Type": "application/json" },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Cập nhật quán ăn thất bại");
  }
};

export const softDeletePartnerRestaurant = async (id) => {
  try {
    const res = await api.delete(`${PARTNER_PREFIX}/restaurants/${encodeURIComponent(id)}`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Xóa quán ăn thất bại");
  }
};

export const pausePartnerRestaurant = async (id) => {
  try {
    const res = await api.post(`${PARTNER_PREFIX}/restaurants/${encodeURIComponent(id)}/pause`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Tạm khóa quán ăn thất bại");
  }
};

export const resumePartnerRestaurant = async (id) => {
  try {
    const res = await api.post(`${PARTNER_PREFIX}/restaurants/${encodeURIComponent(id)}/resume`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Mở lại quán ăn thất bại");
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
    return toError(error, "Gửi yêu cầu mở khóa quán ăn thất bại");
  }
};

// ===== BOOKINGS =====
export const listPartnerHotelBookings = async ({ status, page = 0, size = 10 } = {}) => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/bookings/hotels`, {
      params: { ...(status ? { status } : {}), page, size },
    });
    return { success: true, data: normalizePage(res.data?.data) };
  } catch (error) {
    return toError(error, "Không tải được booking khách sạn");
  }
};

export const getPartnerHotelBookingDetail = async (bookingCode) => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/bookings/hotels/${encodeURIComponent(bookingCode)}`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Không tải được chi tiết booking khách sạn");
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
    return toError(error, "Hủy booking khách sạn thất bại");
  }
};

export const listPartnerRestaurantBookings = async ({ status, page = 0, size = 10 } = {}) => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/bookings/restaurants`, {
      params: { ...(status ? { status } : {}), page, size },
    });
    return { success: true, data: normalizePage(res.data?.data) };
  } catch (error) {
    return toError(error, "Không tải được booking quán ăn");
  }
};

export const getPartnerRestaurantBookingDetail = async (bookingCode) => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/bookings/restaurants/${encodeURIComponent(bookingCode)}`);
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Không tải được chi tiết booking quán ăn");
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
    return toError(error, "Hủy booking quán ăn thất bại");
  }
};

// ===== STATS =====
export const getPartnerStatsByStatus = async ({ from, to } = {}) => {
  try {
    const res = await api.get(`${PARTNER_PREFIX}/stats/status`, {
      params: { ...(from ? { from } : {}), ...(to ? { to } : {}) },
    });
    return { success: true, data: res.data?.data };
  } catch (error) {
    return toError(error, "Không tải được thống kê theo trạng thái");
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
    return toError(error, "Không tải được thống kê doanh thu");
  }
};