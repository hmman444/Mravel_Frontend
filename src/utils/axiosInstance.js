import axios from "axios";
import { getTokens, setTokens, clearTokens } from "./tokenManager";
import { showError } from "./toastUtils";
import { getStore } from "../redux/storeInjector";
import { ErrorCodes } from "../constants/errorCodes";

import { setTokensRedux, setUser } from "../features/auth/slices/authSlice";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";

const api = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

api.interceptors.request.use(
  (config) => {
    const { accessToken } = getTokens();
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (cb) => refreshSubscribers.push(cb);

const onRefreshed = (token) => {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message || "";
    const errorCode = error.response?.data?.data?.code;

    if (
      (status === 401 ||
        (status === 400 && message.includes("JWT expired"))) &&
      !originalRequest._retry
    ) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(api(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { refreshToken } = getTokens();
        if (!refreshToken) throw new Error("No refresh token found");

        const res = await axios.post(`${BASE_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken, refreshToken: newRefresh } = res.data.data;

        const rememberMe = !!localStorage.getItem("accessToken");

        setTokens(accessToken, newRefresh, rememberMe);
        const store = getStore();
        store.dispatch(setTokensRedux({ accessToken, refreshToken: newRefresh }));

        const me = await api.get("/auth/me");
        const currentUser = me?.data?.data ?? me?.data ?? null;

        store.dispatch(setUser(currentUser));

        onRefreshed(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        isRefreshing = false;

        return api(originalRequest);
      } catch (err) {
        console.error("❌ Refresh token failed:", err);
        clearTokens();
        const store = getStore();
        store.dispatch(setTokensRedux({ accessToken: null, refreshToken: null }));
        store.dispatch(setUser(null));
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    // access requests
    if (
      errorCode === ErrorCodes.ACCESS_REQUEST_ALREADY_SUBMITTED ||
      message.includes("Bạn đã gửi yêu cầu trước đó")
    ) {
      showError("Bạn đã gửi yêu cầu trước đó.");
      return Promise.reject(error);
    }

    if (
      errorCode === ErrorCodes.ACCESS_ALREADY_GRANTED ||
      errorCode === ErrorCodes.ACCESS_VIEW_ALREADY_GRANTED ||
      message.includes("Bạn đã có quyền truy cập")
    ) {
      showError("Bạn đã có quyền truy cập.");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
export const isApiRefreshing = () => isRefreshing;