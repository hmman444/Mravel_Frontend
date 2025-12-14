import api from "../../../utils/axiosInstance";

export const getMyUserRestaurantBookings = async () => {
  const res = await api.get("/booking/restaurants/my");
  return res.data?.data || [];
};

export const claimGuestRestaurantBookings = async () => {
  const res = await api.post("/booking/restaurants/claim");
  return res.data?.data ?? 0;
};