import api from "../../../utils/axiosInstance";

const BASE = "/plans";

export async function createPlan(form, user) {
  const body = {
    title: form.title,
    description: form.description,
    startDate: form.startDate,
    endDate: form.endDate,
    visibility: form.visibility,
    images: form.images || [],
    destinations: [],
    authorName: user?.fullname,
    authorAvatar: user?.avatar,
  };

  const res = await api.post(`${BASE}`, body);
  return res.data.data; 
}

export async function fetchPlans(page = 1, size = 5) {
  console.log(
    "🔹 [fetchPlans] sending request:",
    `/api/plans?page=${page}&size=${size}`
  );

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
