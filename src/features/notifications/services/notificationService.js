import api from "../../../utils/axiosInstance";
import partnerApi from "../../../utils/partnerAxiosInstance";
import { getTokens } from "../../../utils/tokenManager";
import i18n from "../../../i18n";

const BASE = "/notifications"; // axiosInstance đã có baseURL gateway hoặc trực tiếp

// Use the regular-user axios when a user token exists, otherwise the partner
// axios (so partners load their notifications with the partner token + refresh).
const client = () => (getTokens().accessToken ? api : partnerApi);

const ensureOk = (res) => {
  const body = res?.data;
  if (body?.success === false) {
    const msg = body?.message || i18n.t("notification.error.generic");
    const err = new Error(msg);
    err.response = { data: body, status: res?.status };
    throw err;
  }
  return body?.data;
};

const toQuery = (params = {}) => {
  const clean = {};
  Object.entries(params).forEach(([k, v]) => {
    if (v === undefined || v === null || v === "") return;
    clean[k] = v;
  });
  return new URLSearchParams(clean).toString();
};

export async function fetchNotifications(params = {}) {
  const query = toQuery(params);
  const res = await client().get(`${BASE}${query ? `?${query}` : ""}`);
  return ensureOk(res);
}

export async function markNotificationRead(id, params = {}) {
  const query = toQuery(params);
  const res = await client().patch(`${BASE}/${id}/read${query ? `?${query}` : ""}`);
  return ensureOk(res); // BE trả unreadCount (Long)
}

export async function markAllNotificationsRead(params = {}) {
  const query = toQuery(params);
  const res = await client().patch(`${BASE}/read-all${query ? `?${query}` : ""}`);
  return ensureOk(res); // unreadCount
}
