import axios from "axios";
import i18n from "../i18n";
import { getTokens, setTokens, clearTokens } from "./tokenManager";
import { decodeJwtPayload } from "./jwt";
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

    // Gắn ngôn ngữ hiện tại để BE trả content/message đúng locale (vi/en)
    const lang = i18n.language || localStorage.getItem("language") || "vi";
    config.headers["Accept-Language"] = lang;

    const store = getStore();
    const authState = store?.getState?.()?.auth;
    const tokenPayload = accessToken ? decodeJwtPayload(accessToken) : null;
    const userId =
      authState?.user?.id ??
      authState?.user?.userId ??
      tokenPayload?.id ??
      tokenPayload?.userId;
    if (userId) {
      config.headers["X-User-Id"] = userId;
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

        // Guard against an unexpected response shape — treat a missing
        // accessToken as a refresh failure instead of crashing on destructure.
        const tokens = res?.data?.data;
        const accessToken = tokens?.accessToken;
        const newRefresh = tokens?.refreshToken;
        if (!accessToken) throw new Error("Refresh response missing access token");

        const rememberMe = !!localStorage.getItem("accessToken");

        setTokens(accessToken, newRefresh, rememberMe);
        const store = getStore();
        store.dispatch(setTokensRedux({ accessToken, refreshToken: newRefresh }));

        // Use plain axios (not the intercepted `api`) to fetch the current user
        // so this call does NOT re-enter the refresh interceptor if it fails.
        try {
          const me = await axios.get(`${BASE_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const currentUser = me?.data?.data ?? me?.data ?? null;
          store.dispatch(setUser(currentUser));
        } catch (_) {
          // Non-fatal: user profile fetch failed after refresh, state stays stale.
          // useAuthSync will re-fetch once accessToken is updated in Redux.
        }

        onRefreshed(accessToken);
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        isRefreshing = false;

        return api(originalRequest);
      } catch (err) {
        clearTokens();
        const store = getStore();
        store.dispatch(setTokensRedux({ accessToken: null, refreshToken: null }));
        store.dispatch(setUser(null));
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    // access requests (dựa trên error code, không so khớp chuỗi)
    if (errorCode === ErrorCodes.ACCESS_REQUEST_ALREADY_SUBMITTED) {
      showError(i18n.t("errors.access_request_already_submitted"));
      return Promise.reject(error);
    }

    if (
      errorCode === ErrorCodes.ACCESS_ALREADY_GRANTED ||
      errorCode === ErrorCodes.ACCESS_VIEW_ALREADY_GRANTED
    ) {
      showError(i18n.t("errors.access_already_granted"));
      return Promise.reject(error);
    }

    // 403: nội dung không khả dụng (vd do chặn / bị gỡ) — hiển thị thông báo thân thiện
    if (status === 403) {
      showError(message || i18n.t("errors.content_unavailable"));
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default api;
export const isApiRefreshing = () => isRefreshing;