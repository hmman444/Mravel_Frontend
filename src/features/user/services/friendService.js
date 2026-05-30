// src/features/profile/services/friendService.js
import api from "../../../utils/axiosInstance";
import i18n from "../../../i18n";

export async function sendFriendRequest(targetUserId) {
  try {
    const res = await api.post("/users/friends/requests", null, {
      params: { targetUserId },
    });
    return { success: true, data: res.data };
  } catch (error) {
    console.error("❌ sendFriendRequest error:", error.response?.data || error.message);
    return {
      success: false,
      message:
        error.response?.data?.message || i18n.t("user.send_friend_request_failed"),
    };
  }
}

export async function acceptFriendRequest(otherUserId) {
  try {
    const res = await api.post(`/users/friends/${otherUserId}/accept`);
    return { success: true, data: res.data };
  } catch (error) {
    console.error("❌ acceptFriendRequest error:", error.response?.data || error.message);
    return {
      success: false,
      message:
        error.response?.data?.message || i18n.t("user.accept_friend_request_failed"),
    };
  }
}

export async function removeFriendOrCancel(otherUserId) {
  try {
    const res = await api.delete(`/users/friends/${otherUserId}`);
    return { success: true, data: res.data };
  } catch (error) {
    console.error("❌ removeFriendOrCancel error:", error.response?.data || error.message);
    return {
      success: false,
      message:
        error.response?.data?.message || i18n.t("user.remove_friend_failed"),
    };
  }
}
