// src/features/auth/services/authService.js
import api from "../../../utils/axiosInstance";

/**
 * POST /auth/login
 */
export const login = async (email, password) => {
  try {
    const response = await api.post(
      "/auth/login",
      { email, password },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

/**
 * GET /auth/me
 * => KHÔNG cần truyền accessToken nữa, axiosInstance tự gắn Authorization
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get("/auth/me");

    // Nếu API trả object user trực tiếp (không bọc success/data)
    if (response.data && !response.data.success) {
      return { success: true, data: response.data };
    }

    return response.data;
  } catch (error) {
    console.error(
      "❌ getCurrentUser error:",
      error.response?.status,
      error.response?.data || error.message
    );
    if (error.response && error.response.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

/**
 * POST /auth/social-login
 */
export const socialLogin = async (provider, token) => {
  try {
    const res = await api.post("/auth/social-login", {
      provider,
      token,
    });
    return res.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

/**
 * POST /auth/register
 */
export const register = async (fullname, email, password) => {
  try {
    const response = await api.post("/auth/register", {
      fullname,
      email,
      password,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

/**
 * POST /auth/verify-otp
 */
export const verifyOtp = async (email, otpCode) => {
  try {
    const response = await api.post("/auth/verify-otp", { email, otpCode });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

/**
 * POST /auth/forgot-password/request
 */
export const requestForgotPassword = async (email) => {
  try {
    const response = await api.post("/auth/forgot-password/request", { email });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

/**
 * POST /auth/forgot-password/reset
 */
export const resetPassword = async (email, otpCode, newPassword) => {
  try {
    const response = await api.post("/auth/forgot-password/reset", {
      email,
      otpCode,
      newPassword,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

/**
 * POST /auth/logout
 */
export const logout = async (refreshToken) => {
  try {
    const response = await api.post("/auth/logout", { refreshToken });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};
