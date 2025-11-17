import api from "../../../utils/axiosInstance";

const BASE = "/plans";

/* ===== BOARD ===== */
export async function fetchBoard(planId) {
  const res = await api.get(`${BASE}/${planId}/board`);
  return res.data;
}

/* ===== LISTS ===== */
export async function createList(planId, payload) {
  const res = await api.post(`${BASE}/${planId}/board/lists`, payload);
  return res.data;
}

export async function renameList(planId, listId, payload) {
  const res = await api.put(`${BASE}/${planId}/board/lists/${listId}/rename`, payload);
  return res.data;
}

export async function deleteList(planId, listId) {
  const res = await api.delete(`${BASE}/${planId}/board/lists/${listId}`);
  return res.data;
}

/* ===== CARDS ===== */
export async function createCard(planId, listId, payload) {
  const res = await api.post(`${BASE}/${planId}/board/lists/${listId}/cards`, payload);
  return res.data;
}

export async function updateCard(planId, listId, cardId, payload) {
  if (!listId) throw new Error("listId is required when updating card");
  const res = await api.put(`${BASE}/${planId}/board/lists/${listId}/cards/${cardId}`, payload);
  return res.data;
}

export async function deleteCard(planId, listId, cardId) {
  const res = await api.delete(`${BASE}/${planId}/board/lists/${listId}/cards/${cardId}`);
  return res.data;
}

export async function duplicateCard(planId, listId, cardId) {
  const res = await api.post(`${BASE}/${planId}/board/lists/${listId}/cards/${cardId}/duplicate`);
  return res.data;
}

/* ===== DRAG & DROP ===== */
export async function reorderBoard(planId, payload) {
  const res = await api.post(`${BASE}/${planId}/board/reorder`, payload);
  return res.data;
}

/* ===== LABELS ===== */
export async function upsertLabel(planId, payload) {
  const res = await api.post(`${BASE}/${planId}/board/labels`, payload);
  return res.data;
}

export async function deleteLabel(planId, labelId) {
  const res = await api.delete(`${BASE}/${planId}/board/labels/${labelId}`);
  return res.data;
}

/* ===== INVITES ===== */
export async function sendInvite(planId, payload) {
  const res = await api.post(`${BASE}/${planId}/board/invites`, payload);
  return res.data;
}

/* ===== SHARE / VISIBILITY ===== */
export async function updateVisibility(planId, visibility) {
  const res = await api.patch(`${BASE}/${planId}/visibility`, null, {
    params: { visibility },
  });
  return res.data;
}

export async function acceptInvite(token) {
  const res = await api.post(`/plans/join`, null, {
    params: { token },
  });
  return res.data;
}

export async function fetchShareInfo(planId) {
  const res = await api.get(`/plans/${planId}/board/share`);
  return res.data;
}

export async function updateMemberRole(planId, payload) {
  const res = await api.patch(`/plans/${planId}/board/members/role`, payload);
  return res.data;
}

export async function removeMember(planId, userId) {
  const res = await api.delete(`/plans/${planId}/board/members`, {
    data: { userId },
  });
  return res.data;
}

export async function requestAccess(planId, payload) {
  const res = await api.post(`/plans/${planId}/board/requests`, payload);
  return res.data;
}

export async function fetchRequests(planId) {
  const res = await api.get(`/plans/${planId}/board/requests`);
  return res.data;
}

export async function handleRequest(planId, reqId, payload) {
  const res = await api.patch(`/plans/${planId}/board/requests/${reqId}`, payload);
  return res.data;
}
