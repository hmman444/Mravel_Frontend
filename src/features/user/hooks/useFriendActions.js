// src/features/profile/hooks/useFriendActions.js
import { useState, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriendOrCancel,
} from "../services/friendService";
import { showSuccess, showError } from "../../../utils/toastUtils";

export function useFriendActions(profileUserId, relationship, reloadProfile) {
  const { user: me } = useSelector((s) => s.auth);
  const [loadingAction, setLoadingAction] = useState(false);

  const isMe =
    me?.id != null && profileUserId != null && String(me.id) === String(profileUserId);

  const relationType = relationship?.type || "NONE";
  const isFriend = relationship?.friend || relationType === "FRIEND";
  const isRequestSent = relationType === "REQUEST_SENT";
  const isRequestReceived = relationType === "REQUEST_RECEIVED";
  const isBlocked = relationType === "BLOCKED";

  async function safeCall(fn, successMsg) {
    setLoadingAction(true);
    try {
      const ok = await fn();
      if (!ok?.success) {
        showError(ok?.message || "Thao tác thất bại");
      } else {
        if (successMsg) showSuccess(successMsg);
        if (reloadProfile) reloadProfile();
      }
    } finally {
      setLoadingAction(false);
    }
  }

  const handleSendRequest = () =>
    safeCall(
      () => sendFriendRequest(profileUserId),
      "Đã gửi lời mời kết bạn."
    );

  const handleAcceptRequest = () =>
    safeCall(
      () => acceptFriendRequest(profileUserId),
      "Đã chấp nhận lời mời kết bạn."
    );

  const handleRemoveOrCancel = () =>
    safeCall(
      () => removeFriendOrCancel(profileUserId),
      isFriend ? "Đã xóa bạn." : "Đã hủy lời mời kết bạn."
    );

  const uiState = useMemo(() => {
    if (isMe) {
      return { mode: "ME" };
    }
    if (isBlocked) {
      return {
        mode: "BLOCKED",
        label: "Đã chặn",
        subLabel: null,
        variant: "secondary",
        disabled: true,
      };
    }
    if (isFriend) {
      return {
        mode: "FRIEND",
        label: "Bạn bè",
        subLabel: "Xóa bạn",
        variant: "primary",
      };
    }
    if (isRequestSent) {
      return {
        mode: "REQUEST_SENT",
        label: "Đã gửi lời mời",
        subLabel: "Hủy lời mời",
        variant: "secondary",
      };
    }
    if (isRequestReceived) {
      return {
        mode: "REQUEST_RECEIVED",
        label: "Chấp nhận",
        subLabel: "Xóa lời mời",
        variant: "primary",
      };
    }
    return {
      mode: "NONE",
      label: "Kết bạn",
      subLabel: null,
      variant: "primary",
    };
  }, [isMe, isBlocked, isFriend, isRequestSent, isRequestReceived]);

  return {
    isMe,
    loadingAction,
    relationType,
    isFriend,
    isRequestSent,
    isRequestReceived,
    isBlocked,
    uiState,
    handleSendRequest,
    handleAcceptRequest,
    handleRemoveOrCancel,
  };
}
