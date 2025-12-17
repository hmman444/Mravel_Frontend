import axios from "axios";
import { getTokens, setTokens, clearTokens } from "./tokenManager";
import { showError } from "./toastUtils";
import { getStore } from "../redux/storeInjector";

import { setTokensRedux, setUser } from "../features/auth/slices/authSlice";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

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

        store.dispatch(setUser(me.data.data));

        onRefreshed(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        isRefreshing = false;

        return api(originalRequest);
      } catch (err) {
        console.error("❌ Refresh token failed:", err);
        clearTokens();
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    // access requests
    if (message.includes("Bạn đã gửi yêu cầu trước đó")) {
      showError("Bạn đã gửi yêu cầu trước đó.");
      return Promise.reject(error);
    }

    if (message.includes("Bạn đã có quyền truy cập")) {
      showError("Bạn đã có quyền truy cập.");
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
export const isApiRefreshing = () => isRefreshing;