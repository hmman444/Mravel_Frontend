// src/features/user/services/userProfileService.js
import api from "../../../utils/axiosInstance";

export const updateMyProfile = async (payload) => {
  try {
    const res = await api.put("/users/me", payload);

    return {
      success: true,
      data: res.data, 
    };
  } catch (error) {
    console.error(
      "❌ updateMyProfile error:",
      error.response?.data || error.message
    );

    const message =
      error.response?.data?.message ||
      error.response?.data?.error ||
      "Không thể cập nhật hồ sơ. Vui lòng thử lại.";

    return {
      success: false,
      message,
    };
  }
};
