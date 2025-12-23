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

export async function sharePlan(planId, email) {
  const res = await api.post(`${BASE}/${planId}/share`, { email });
  return res.data.data;
}

export async function fetchMyPlans(page = 1, size = 5) {
  const res = await api.get(`/plans/me?page=${page}&size=${size}`);
  return res.data.data;
}

export async function searchPlansAndUsers(q, page = 1, size = 10) {
  const params = new URLSearchParams();
  params.set("q", q || "");
  params.set("page", String(page));
  params.set("size", String(size));

  const res = await api.get(`${BASE}/search?${params.toString()}`);
  return res.data.data;
}