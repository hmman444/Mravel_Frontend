import api from "../../../utils/axiosInstance";

export const getMyUserBookings = async () => {
  const res = await api.get("/booking/my");
  return res.data?.data || [];
};

export const getMyUserBookingDetail = async (code) => {
  const res = await api.get(`/booking/bookings/${encodeURIComponent(code)}`);
  return res.data?.data; // HotelBookingDetailDTO
};

export const claimGuestBookings = async () => {
  const res = await api.post("/booking/bookings/claim");
  return res.data?.data ?? 0;
};