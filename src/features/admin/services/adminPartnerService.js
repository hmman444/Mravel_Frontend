import axios from "../../../utils/axiosInstance";

export const fetchAdminPartners = async ({ q = "", page = 0, size = 20 } = {}) => {
  const res = await axios.get("/admin/auth/users", {
    params: { role: "PARTNER", q, page, size },
  });
  return res.data; // ApiResponse
};

export const lockPartner = async (id) => {
  const res = await axios.patch(`/admin/auth/users/${id}/lock`);
  return res.data;
};

export const unlockPartner = async (id) => {
  const res = await axios.patch(`/admin/auth/users/${id}/unlock`);
  return res.data;
};
