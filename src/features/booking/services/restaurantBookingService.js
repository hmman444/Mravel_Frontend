import axios from "axios";
import api from "../../../utils/axiosInstance";

const API_URL = import.meta.env.VITE_API_URL;

const CATALOG_PREFIX = `${API_URL}/catalog`;
const RESTAURANT_INVENTORY_PREFIX = `${CATALOG_PREFIX}/restaurants/inventory`;

const BOOKING_PREFIX = "/booking";
const RESTAURANT_BOOKING_PREFIX = `${BOOKING_PREFIX}/restaurants`;

const toError = (error, fallback = "Lỗi kết nối đến server") => {
  if (error?.response?.data) {
    const msg = error.response.data.message || error.response.data.error || fallback;
    return { success: false, message: msg };
  }
  return { success: false, message: fallback };
};

export const fmtDate = (d) => {
  if (!d) return "";
  const x = new Date(d);
  return x.toISOString().slice(0, 10);
};

export const normalizeTimeHHmm = (t) => {
  if (!t) return "";
  const s = String(t).trim();
  // expect "HH:mm"
  const m = s.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return "";
  let hh = Math.min(23, Math.max(0, parseInt(m[1], 10)));
  let mm = Math.min(59, Math.max(0, parseInt(m[2], 10)));
  const HH = String(hh).padStart(2, "0");
  const MM = String(mm).padStart(2, "0");
  return `${HH}:${MM}`;
};

export const createRestaurantBookingAndPay = async (payload) => {
  try {
    const res = await api.post(`${RESTAURANT_BOOKING_PREFIX}`, payload, {
      headers: { "Content-Type": "application/json" },
    });

    const apiRes = res?.data ?? res;
    const dto = apiRes?.data ?? apiRes;
    return { success: true, data: dto };
  } catch (error) {
    console.error("createRestaurantBookingAndPay error:", error?.response || error);
    return toError(error, "Không tạo được thanh toán đặt bàn");
  }
};

/**
 * GET /api/catalog/restaurants/inventory/availability
 * params: restaurantId|restaurantSlug, tableTypeId, reservationDate(YYYY-MM-DD), reservationTime(HH:mm), tables
 */
export const getRestaurantAvailability = async ({
  restaurantId,
  tableTypeId,
  reservationDate,
  reservationTime,
  tables = 1,
}) => {
  try {
    const res = await axios.get(`${RESTAURANT_INVENTORY_PREFIX}/availability`, {
      params: {
        ...(restaurantId ? { restaurantId } : {}),
        tableTypeId,
        reservationDate,
        reservationTime,
        tables,
      },
    });

    return { success: true, data: res.data?.data };
  } catch (error) {
    console.error("getRestaurantAvailability error:", error?.response || error);
    return toError(error, "Không kiểm tra được bàn trống");
  }
};