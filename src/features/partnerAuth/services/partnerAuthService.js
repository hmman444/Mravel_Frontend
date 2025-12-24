// src/features/partnerAuth/services/partnerAuthService.js
import partnerApi from "../../../utils/partnerAxiosInstance";

const AUTH_BASE = "/auth";                 //  logout/refresh/... (chung)
const PARTNER_AUTH_BASE = "/auth/partner"; //  login/register/verify/social
const ME_PATH = "/partner/me";             //  /api/partner/me

export const partnerLogin = async (email, password) => {
  try {
    const res = await partnerApi.post(
      `${PARTNER_AUTH_BASE}/login`,
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
    const res = await partnerApi.get(ME_PATH);
    const body = res.data;
    if (body && typeof body === "object" && "success" in body) return body;
    return { success: true, data: body };
  } catch (error) {
    if (error.response?.data) return error.response.data;
    return { success: false, message: "Không lấy được thông tin đối tác" };
  }
};

export const partnerSocialLogin = async (provider, token) => {
  try {
    const res = await partnerApi.post(`${PARTNER_AUTH_BASE}/social-login`, { provider, token });
    return res.data;
  } catch (error) {
    if (error.response?.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

export const partnerRegister = async (fullname, email, password) => {
  try {
    const res = await partnerApi.post(`${PARTNER_AUTH_BASE}/register`, { fullname, email, password });
    return res.data;
  } catch (error) {
    if (error.response?.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

export const partnerVerifyOtp = async (email, otpCode) => {
  try {
    const res = await partnerApi.post(`${PARTNER_AUTH_BASE}/verify-otp`, { email, otpCode });
    return res.data;
  } catch (error) {
    if (error.response?.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

export const partnerRequestForgotPassword = async (email) => {
  try {
    const res = await partnerApi.post(`${PARTNER_AUTH_BASE}/forgot-password/request`, { email });
    return res.data;
  } catch (error) {
    if (error.response?.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};

export const partnerResetPassword = async (email, otpCode, newPassword) => {
  try {
    const res = await partnerApi.post(`${PARTNER_AUTH_BASE}/forgot-password/reset`, {
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

//  Logout gọi endpoint chung /auth/logout
export const partnerLogout = async (refreshToken) => {
  try {
    const res = await partnerApi.post(`${AUTH_BASE}/logout`, { refreshToken });
    return res.data;
  } catch (error) {
    if (error.response?.data) return error.response.data;
    return { success: false, message: "Lỗi kết nối đến server" };
  }
};