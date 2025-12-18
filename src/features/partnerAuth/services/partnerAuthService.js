// src/features/partnerAuth/services/partnerAuthService.js
import partnerApi from "../../../utils/partnerAxiosInstance";

const BASE = "/auth/partner";

export const partnerLogin = async (email, password) => {
  try {
    const res = await partnerApi.post(
      `${BASE}/login`,
      { email, password },
      { headers: { "Content-Type": "application/json" } }
    );
    return res.data;
  } catch (error) {
    if (error.response?.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

export const getCurrentPartner = async () => {
  try {
    const res = await partnerApi.get(`${BASE}/me`);
    if (res.data && !res.data.success) return { success: true, data: res.data };
    return res.data;
  } catch (error) {
    if (error.response?.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

export const partnerSocialLogin = async (provider, token) => {
  try {
    const res = await partnerApi.post(`${BASE}/social-login`, { provider, token });
    return res.data;
  } catch (error) {
    if (error.response?.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

export const partnerRegister = async (fullname, email, password) => {
  try {
    const res = await partnerApi.post(`${BASE}/register`, { fullname, email, password });
    return res.data;
  } catch (error) {
    if (error.response?.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

export const partnerVerifyOtp = async (email, otpCode) => {
  try {
    const res = await partnerApi.post(`${BASE}/verify-otp`, { email, otpCode });
    return res.data;
  } catch (error) {
    if (error.response?.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

export const partnerRequestForgotPassword = async (email) => {
  try {
    const res = await partnerApi.post(`${BASE}/forgot-password/request`, { email });
    return res.data;
  } catch (error) {
    if (error.response?.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

export const partnerResetPassword = async (email, otpCode, newPassword) => {
  try {
    const res = await partnerApi.post(`${BASE}/forgot-password/reset`, {
      email,
      otpCode,
      newPassword,
    });
    return res.data;
  } catch (error) {
    if (error.response?.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

export const partnerLogout = async (refreshToken) => {
  try {
    const res = await partnerApi.post(`${BASE}/logout`, { refreshToken });
    return res.data;
  } catch (error) {
    if (error.response?.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};
