// src/features/user/services/userProfileService.js
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const updateMyProfile = async (payload, accessToken) => {
  try {
    const res = await axios.put(`${API_URL}/users/me`, payload, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

    // Backend user-service trả trực tiếp UserProfileResponse
    // => wrap lại cho giống style các service khác
    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("❌ updateMyProfile error:", error.response?.data || error.message);

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