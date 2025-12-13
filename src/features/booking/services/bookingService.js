// src/features/booking/services/bookingService.js
import axios from "axios";
import api from "../../../utils/axiosInstance";

const API_URL = import.meta.env.VITE_API_URL;

const CATALOG_PREFIX = `${API_URL}/catalog`;
const HOTEL_INVENTORY_PREFIX = `${CATALOG_PREFIX}/hotels/inventory`;

const BOOKING_PREFIX = "/booking";
const HOTEL_BOOKING_PREFIX = `${BOOKING_PREFIX}/hotels`;

const toError = (error, fallback = "Lỗi kết nối đến server") => {
  if (error?.response?.data) {
    const msg = error.response.data.message || error.response.data.error || fallback;
    return { success: false, message: msg };
  }
  return { success: false, message: fallback };
};

const fmt = (d) => {
  if (!d) return "";
  const x = new Date(d);
  return x.toISOString().slice(0, 10);
};

export const createHotelBookingAndPay = async (payload) => {
  try {
    const res = await api.post(`${HOTEL_BOOKING_PREFIX}`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    const apiRes = res?.data ?? res;            // ApiResponse hoặc DTO
    const dto = apiRes?.data ?? apiRes;         // lấy inner data nếu có

    return { success: true, data: dto };
  } catch (error) {
    console.error("createHotelBookingAndPay error:", error?.response || error);
    return toError(error, "Không tạo được thanh toán");
  }
};

/**
 * GET /api/catalog/hotels/inventory/availability
 */
export const getHotelAvailability = async ({
  hotelId,
  hotelSlug,
  roomTypeId,
  checkIn,
  checkOut,
  rooms = 1,
}) => {
  try {
    const res = await axios.get(`${HOTEL_INVENTORY_PREFIX}/availability`, {
      params: {
        ...(hotelId ? { hotelId } : {}),
        ...(hotelSlug ? { hotelSlug } : {}),
        roomTypeId,
        checkIn: fmt(checkIn),
        checkOut: fmt(checkOut),
        rooms,
      },
    });

    return { success: true, data: res.data?.data };
  } catch (error) {
    console.error("getHotelAvailability error:", error?.response || error);
    return toError(error, "Không kiểm tra được phòng trống");
  }
};

export { fmt };