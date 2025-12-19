// src/utils/partnerAxiosInstance.js
import axios from "axios";
import { getStore } from "../redux/storeInjector";
import {
  getPartnerTokens,
  setPartnerTokens,
  clearPartnerTokens,
} from "./partnerTokenManager";
import {
  setPartnerTokensRedux,
  setPartnerUser,
} from "../features/partnerAuth/slices/partnerAuthSlice";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080/api";

const partnerApi = axios.create({
  baseURL: BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: true,
});

partnerApi.interceptors.request.use(
  (config) => {
    const { accessToken } = getPartnerTokens();
    if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`;
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

partnerApi.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;
    const message = error.response?.data?.message || "";

    const shouldRefresh =
      (status === 401 || (status === 400 && message.includes("JWT expired"))) &&
      !originalRequest?._retry;

    if (!shouldRefresh) return Promise.reject(error);

    if (isRefreshing) {
      return new Promise((resolve) => {
        subscribeTokenRefresh((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(partnerApi(originalRequest));
        });
      });
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const { refreshToken } = getPartnerTokens();
      if (!refreshToken) throw new Error("No partner refresh token found");

      // Partner refresh endpoint
      const refreshRes = await axios.post(`${BASE_URL}/auth/partner/refresh`, {
        refreshToken,
      });

      const { accessToken, refreshToken: newRefresh } = refreshRes.data.data;

      const rememberMe = !!localStorage.getItem("partnerAccessToken");
      setPartnerTokens(accessToken, newRefresh, rememberMe);

      const store = getStore();
      store.dispatch(setPartnerTokensRedux({ accessToken, refreshToken: newRefresh }));

      // Partner me endpoint
      const meRes = await partnerApi.get("/auth/partner/me");
      store.dispatch(setPartnerUser(meRes.data.data || meRes.data));

      onRefreshed(accessToken);
      originalRequest.headers.Authorization = `Bearer ${accessToken}`;
      isRefreshing = false;

      return partnerApi(originalRequest);
    } catch (err) {
      clearPartnerTokens();
      isRefreshing = false;
      window.location.href = "/partner/login";
      return Promise.reject(err);
    }
  }
);

export default partnerApi;
export const isPartnerApiRefreshing = () => isRefreshing;