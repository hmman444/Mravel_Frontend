import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (email, password) => {
  try {
    const response = await axios.post(
      `${API_URL}/auth/login`,
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

export const getCurrentUser = async (accessToken) => {
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    // Kiểm tra nếu API trả về object user trực tiếp thì bọc lại
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

export const socialLogin = async (provider, token) => {
  try {
    const res = await axios.post(`${API_URL}/auth/social-login`, {
      provider,
      token,
    });
    return res.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

export const register = async (fullname, email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, {
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

export const verifyOtp = async (email, otpCode) => {
  try {
    const response = await axios.post(`${API_URL}/auth/verify-otp`, { email, otpCode });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

export const requestForgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password/request`, { email });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

export const resetPassword = async (email, otpCode, newPassword) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password/reset`, {
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

export const logout = async (refreshToken) => {
  try {
    const response = await axios.post(`${API_URL}/auth/logout`, { refreshToken });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};
