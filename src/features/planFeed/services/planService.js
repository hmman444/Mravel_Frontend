import api from "../../../utils/axiosInstance"

const BASE = "/plans"; 

export async function fetchPlans(page = 1, size = 5) {
  const res = await api.get(`${BASE}?page=${page}&size=${size}`);
  return res.data;
}

export async function fetchPlanById(id) {
  const res = await api.get(`${BASE}/${id}`);
  return res.data;
}

export async function sendReaction(planId, key, user) {
  const params = new URLSearchParams({
    key,
    userId: user.id,
    userName: user.fullname,
    userAvatar: user.avatar,
  });

  const res = await api.post(`${BASE}/${planId}/reactions?${params.toString()}`);
  return res.data;
}

export async function sendComment(planId, comment) {
  const res = await api.post(`${BASE}/${planId}/comments`, comment);
  return res.data;
}

export async function sharePlan(planId, email) {
  const res = await api.post(`${BASE}/${planId}/share`, { email });
  return res.data;
}
