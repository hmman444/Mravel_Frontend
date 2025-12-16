import api from "../../../utils/axiosInstance";

export const getMyGuestBookings = async () => {
  const res = await api.get("/booking/public/my");
  return res.data?.data || [];
};

export const getGuestBookingDetail = async (code) => {
  const res = await api.get(`/booking/public/my/${encodeURIComponent(code)}`);
  return res.data?.data; // HotelBookingDetailDTO
};

export const lookupGuestBooking = async ({ bookingCode, phoneLast4, email }) => {
  const res = await api.post("/booking/public/lookup", { bookingCode, phoneLast4, email });
  return res.data?.data ?? res.data?.result ?? res.data;
};

export const clearGuestBookings = async () => {
  const res = await api.post("/booking/public/clear");
  return res.data;
};