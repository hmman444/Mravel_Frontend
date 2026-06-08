import api from "../../../utils/axiosInstance";
import i18n from "../../../i18n";

const BASE = "/admin/reviews";

const ensureOk = (res) => {
  const body = res?.data;
  if (body?.success === false) {
    const msg = body?.message || body?.error || i18n.t("admin.error_occurred");
    const err = new Error(msg);
    err.response = { data: body, status: res?.status };
    throw err;
  }
  return body?.data;
};

const normalizePage = (page) => ({
  items: page?.content ?? [],
  page: page?.number ?? 0,
  size: page?.size ?? 0,
  totalElements: page?.totalElements ?? 0,
  totalPages: page?.totalPages ?? 0,
});

/** Danh sách đánh giá tiêu cực (rating ≤ maxRating). */
export async function fetchNegativeReviews(params = {}) {
  const res = await api.get(`${BASE}/negative`, { params });
  return normalizePage(ensureOk(res));
}

/** Tổng số đánh giá tiêu cực của loại cơ sở (cho thẻ thống kê). */
export async function fetchNegativeCount(params = {}) {
  const res = await api.get(`${BASE}/negative/count`, { params });
  return ensureOk(res);
}

/** Admin xoá một đánh giá vi phạm/spam. */
export async function deleteReview(id) {
  const res = await api.delete(`${BASE}/${id}`);
  return ensureOk(res);
}
