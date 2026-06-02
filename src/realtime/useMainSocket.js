// src/realtime/useMainSocket.js
import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { mainSocket } from "./mainSocket";
import { decodeJwtPayload } from "../utils/jwt";
import { getTokens, setTokens, clearTokens } from "../utils/tokenManager";
import { setTokensRedux } from "../features/auth/slices/authSlice";

const BASE_URL = import.meta.env.VITE_API_URL || "/api";
const REFRESH_LEEWAY_MS = 5 * 60_000;
const REFRESH_CHECK_INTERVAL_MS = 20_000;

export function useMainSocket() {
  const dispatch = useDispatch();

  // Keep this in sync with other auth selectors to avoid stale WS token.
  // Falls back to the partner token so partners also get a live socket.
  const accessToken = useSelector(
    (s) =>
      s.auth?.accessToken ||
      s.auth?.token ||
      s.auth?.user?.accessToken ||
      s.partnerAuth?.accessToken
  );
  const isAuthenticated = !!accessToken;
  const refreshInFlightRef = useRef(false);

  useEffect(() => {
    if (isAuthenticated) {
      mainSocket.connect(accessToken);
    } else {
      mainSocket.disconnect();
    }

    // Do not disconnect in this effect cleanup — token refresh would force
    // unnecessary reconnect churn.
  }, [isAuthenticated, accessToken]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshIfNeeded = async () => {
      if (refreshInFlightRef.current) return;

      const payload = decodeJwtPayload(accessToken);
      const expMs = payload?.exp ? payload.exp * 1000 : null;
      if (!expMs) return;

      const msLeft = expMs - Date.now();
      if (msLeft > REFRESH_LEEWAY_MS) return;

      const { refreshToken } = getTokens();
      if (!refreshToken) return;

      refreshInFlightRef.current = true;
      try {
        const res = await axios.post(`${BASE_URL}/auth/refresh`, { refreshToken });
        const { accessToken: newAccess, refreshToken: newRefresh } = res?.data?.data || {};
        if (!newAccess || !newRefresh) {
          throw new Error("Invalid refresh response");
        }

        const rememberMe = !!localStorage.getItem("accessToken");
        setTokens(newAccess, newRefresh, rememberMe);
        dispatch(setTokensRedux({ accessToken: newAccess, refreshToken: newRefresh }));
        mainSocket.connect(newAccess);
      } catch (err) {
        // If refresh fails, stop WS reconnect loop with stale token.
        clearTokens();
        mainSocket.disconnect();
      } finally {
        refreshInFlightRef.current = false;
      }
    };

    refreshIfNeeded();
    const timerId = window.setInterval(refreshIfNeeded, REFRESH_CHECK_INTERVAL_MS);
    return () => window.clearInterval(timerId);
  }, [isAuthenticated, accessToken, dispatch]);

  useEffect(() => {
    // cleanup khi unmount toàn app (hiếm)
    return () => {
      mainSocket.disconnect();
    };
  }, []);
}
