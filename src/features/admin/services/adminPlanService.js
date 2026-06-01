// src/features/admin/services/adminPlanService.js
import api from "../../../utils/axiosInstance";
import i18n from "../../../i18n";

const BASE = "/admin/plans";

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

/** Thống kê tổng hợp plan/post (overview + distributions + timeseries + top). */
export async function fetchPlanStats(days = 30) {
  const res = await api.get(`${BASE}/stats?days=${days}`);
  return ensureOk(res);
}

/** Hàng đợi report. status: PENDING | REVIEWING | RESOLVED | DISMISSED (optional). */
export async function fetchPlanReports(params = {}) {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`${BASE}/reports${query ? `?${query}` : ""}`);
  return ensureOk(res);
}

/** Gỡ bài: ép PRIVATE + khóa vĩnh viễn (không thể bật lại). */
export async function takedownPlan(id, reason) {
  const q = reason ? `?reason=${encodeURIComponent(reason)}` : "";
  const res = await api.patch(`${BASE}/${id}/takedown${q}`);
  return ensureOk(res);
}

/** Xử lý report. action: NONE | TAKEDOWN. */
export async function resolveReport(id, action = "NONE", reason) {
  const params = { action };
  if (reason) params.reason = reason;
  const q = new URLSearchParams(params).toString();
  const res = await api.post(`${BASE}/reports/${id}/resolve?${q}`);
  return ensureOk(res);
}
