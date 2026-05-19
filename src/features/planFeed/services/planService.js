import api from "../../../utils/axiosInstance";

const BASE = "/plans";

export async function createPlan(form, user) {
  const toNumberOrNull = (v) => {
    if (v === null || v === undefined || v === "") return null;
    const n = Number(v);
    return Number.isNaN(n) ? null : n;
  };

  const body = {
    title: form.title,
    description: form.description,
    startDate: form.startDate,
    endDate: form.endDate,
    visibility: form.visibility,
    destinations: [],

    authorName: user?.fullname,
    authorAvatar: user?.avatar,

    budgetCurrency: form.budgetCurrency || "VND",
    budgetTotal: toNumberOrNull(form.budgetTotal),
    budgetPerPerson: toNumberOrNull(form.budgetPerPerson),
  };

  const res = await api.post(`${BASE}`, body);
  return res.data.data;
}

export async function fetchPlanFeedDetail(id) {
  const res = await api.get(`${BASE}/${id}/feed`);
  return res.data.data;
}

export async function fetchPlans(page = 1, size = 5) {
  const res = await api.get(`${BASE}?page=${page}&size=${size}`);
  return res.data.data;
}

export async function fetchPlanById(id, isFriend = false) {
  const res = await api.get(`${BASE}/${id}?isFriend=${isFriend}`);
  return res.data.data;
}

export async function sendReaction(planId, key) {
  const params = new URLSearchParams({ key });
  const res = await api.post(
    `${BASE}/${planId}/reactions?${params.toString()}`
  );
  return res.data.data;
}

export async function sendComment(planId, comment) {
  const res = await api.post(`${BASE}/${planId}/comments`, comment);
  return res.data.data;
}

export async function reactToComment(commentId, type) {
  const params = new URLSearchParams({ type });
  const res = await api.post(`${BASE}/comments/${commentId}/reactions?${params.toString()}`);
  return res.data.data; // CommentReactionResponse: { commentId, reactions, myReaction }
}

export async function sharePlan(planId, email) {
  const res = await api.post(`${BASE}/${planId}/share`, { email });
  return res.data.data;
}

export async function fetchMyPlans(page = 1, size = 5) {
  const res = await api.get(`/plans/me?page=${page}&size=${size}`);
  return res.data.data;
}

/**
 * Advanced search — cursor-based pagination via Elasticsearch search_after.
 *
 * @param {string}      q       — free-text keyword
 * @param {object}      filters — { budgetMin, budgetMax, daysMin, daysMax,
 *                                  startDateFrom, startDateTo, destinations[],
 *                                  sortBy }
 * @param {string|null} cursor  — opaque cursor from previous response; null = first page
 * @param {number}      size
 */
export async function addPlanVideo(planId, url) {
  const res = await api.post(`${BASE}/${planId}/videos`, { url });
  return res.data;
}

export async function removePlanVideo(planId, url) {
  const res = await api.delete(`${BASE}/${planId}/videos`, { data: { url } });
  return res.data;
}

export async function searchPlansAndUsers(q, filters = {}, cursor = null, size = 10) {
  const params = new URLSearchParams();
  params.set("q", q || "");
  params.set("size", String(size));

  if (cursor)                 params.set("cursor",         cursor);
  if (filters.budgetMin)      params.set("budgetMin",      String(filters.budgetMin));
  if (filters.budgetMax)      params.set("budgetMax",      String(filters.budgetMax));
  if (filters.daysMin)        params.set("daysMin",        String(filters.daysMin));
  if (filters.daysMax)        params.set("daysMax",        String(filters.daysMax));
  if (filters.startDateFrom)  params.set("startDateFrom",  filters.startDateFrom);
  if (filters.startDateTo)    params.set("startDateTo",    filters.startDateTo);
  if (filters.sortBy)         params.set("sortBy",         filters.sortBy);

  // Repeated param for array
  (filters.destinations || []).forEach((d) => params.append("destinations", d));

  const res = await api.get(`${BASE}/search?${params.toString()}`);
  return res.data.data;
}