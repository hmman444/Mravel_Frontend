// src/features/profile/services/userProfileService.js
import api from "../../../utils/axiosInstance";

export const getUserProfilePage = async (userId) => {
  try {
    const res = await api.get(`/users/${userId}/profile-page`);
    return { success: true, data: res.data };
  } catch (error) {
    console.error("❌ getUserProfilePage error:", error.response?.data || error.message);

    return {
      success: false,
      message:
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Không thể tải hồ sơ người dùng",
    };
  }
};

export const updateMyProfile = async (payload) => {
  try {
    const res = await api.put("/users/me", payload);
    return { success: true, data: res.data };
  } catch (error) {
    console.error("❌ updateMyProfile error:", error.response?.data || error.message);
    return {
      success: false,
      message: error.response?.data?.message || "Không thể cập nhật hồ sơ.",
    };
  }
};

export const uploadAvatarOrCover = async (file) => {
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;

  const form = new FormData();
  form.append("file", file);
  form.append("upload_preset", preset);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
    { method: "POST", body: form }
  );

  const data = await res.json();
  if (!data.secure_url) throw new Error("Upload failed");

  return data.secure_url;
};