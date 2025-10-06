import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const login = async (email, password) => {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    return response.data;
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
    const response = await axios.post(`${API_URL}/auth/verify-otp`, {
      email,
      otpCode,
    });
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

export const requestForgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_URL}/auth/forgot-password/request`, {
      email,
    });
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
