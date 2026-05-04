import api from "../../../utils/axiosInstance";

const BASE = "/chat/conversations";

export const fetchConversations = () =>
  api.get(BASE).then((r) => r.data.data);

export const fetchConversationDetail = (id) =>
  api.get(`${BASE}/${id}`).then((r) => r.data.data);

export const createPrivateConversation = (recipientId) =>
  api.post(`${BASE}/private`, { recipientId }).then((r) => r.data.data);

export const createGroupConversation = (name, memberIds) =>
  api.post(`${BASE}/group`, { name, memberIds }).then((r) => r.data.data);

export const renameGroup = (id, name) =>
  api.patch(`${BASE}/${id}/name`, { name }).then((r) => r.data.data);

export const addMembers = (id, userIds) =>
  api.post(`${BASE}/${id}/members`, { userIds }).then((r) => r.data);

export const removeMember = (id, targetUserId) =>
  api.delete(`${BASE}/${id}/members/${targetUserId}`).then((r) => r.data);

export const leaveConversation = (id) =>
  api.delete(`${BASE}/${id}/leave`).then((r) => r.data);

export const changeMemberRole = (id, targetUserId, role) =>
  api.patch(`${BASE}/${id}/members/${targetUserId}/role`, { role }).then((r) => r.data);

export const transferOwnership = (id, newOwnerId) =>
  api.patch(`${BASE}/${id}/transfer`, { newOwnerId }).then((r) => r.data);

export const fetchMessages = (conversationId, params = {}) =>
  api.get(`${BASE}/${conversationId}/messages`, { params }).then((r) => r.data.data);

export const sendMessage = (conversationId, content) =>
  api.post(`${BASE}/${conversationId}/messages`, { content }).then((r) => r.data.data);

export const markSeen = (conversationId, lastMessageId) =>
  api.post(`${BASE}/${conversationId}/messages/seen`, { lastMessageId }).then((r) => r.data);

export const sendTyping = (conversationId) =>
  api.post(`${BASE}/${conversationId}/messages/typing`).then((r) => r.data);

export const searchUsers = (q) =>
  api.get(`/users/search`, { params: { q, limit: 20 } }).then((r) => r.data.data);

export const fetchFriends = () =>
  api.get(`/users/friends/list`).then((r) => r.data.data);
