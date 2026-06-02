// src/features/admin/services/adminDashboardService.js
import api from "../../../utils/axiosInstance";
import i18n from "../../../i18n";

const BASE = "/admin/dashboard";

const ensureOk = (res) => {
  const body = res?.data;
  if (body?.success === false) {
    const msg = body?.message || i18n.t("admin.error_generic", "Đã có lỗi xảy ra");
    const err = new Error(msg);
    err.response = { data: body, status: res?.status };
    throw err;
  }
  return body?.data;
};

/**
 * Số liệu tổng quan admin dashboard (overview + alerts + actionQueue +
 * revenueSeries + bookingStatus + topServices + topPartners).
 * range: today | weekly | monthly | yearly
 */
export async function fetchDashboard(range = "weekly") {
  const res = await api.get(`${BASE}?range=${encodeURIComponent(range)}`);
  return ensureOk(res);
}
