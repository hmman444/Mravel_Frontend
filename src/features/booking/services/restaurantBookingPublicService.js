import api from "../../../utils/axiosInstance";

export const getMyGuestRestaurantBookings = async () => {
  const res = await api.get("/booking/public/restaurants/my");
  return res.data?.data || [];
};

export const getGuestRestaurantBookingDetail = async (code) => {
  const res = await api.get(`/booking/public/restaurants/my/${encodeURIComponent(code)}`);
  return res.data?.data;
};

export const lookupGuestRestaurantBooking = async ({ bookingCode, phoneLast4, email }) => {
  const res = await api.post("/booking/public/restaurants/lookup", {
    bookingCode,
    phoneLast4,
    email,
  });
  return res.data?.data;
};

export const clearGuestRestaurantBookings = async () => {
  const res = await api.post("/booking/public/restaurants/clear");
  return res.data;
};

export const getUserRestaurantBookingDetail = async (code) => {
  const res = await api.get(`/booking/restaurants/${encodeURIComponent(code)}`);
  return res.data?.data;
};