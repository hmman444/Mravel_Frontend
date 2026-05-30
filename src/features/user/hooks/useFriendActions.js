// src/features/profile/hooks/useFriendActions.js
import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import {
  sendFriendRequest,
  acceptFriendRequest,
  removeFriendOrCancel,
} from "../services/friendService";
import { showSuccess, showError } from "../../../utils/toastUtils";

export function useFriendActions(profileUserId, relationship, reloadProfile) {
  const { t } = useTranslation();
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
        showError(ok?.message || t("user.action_failed"));
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
      t("user.friend_request_sent")
    );

  const handleAcceptRequest = () =>
    safeCall(
      () => acceptFriendRequest(profileUserId),
      t("user.friend_request_accepted")
    );

  const handleRemoveOrCancel = () =>
    safeCall(
      () => removeFriendOrCancel(profileUserId),
      isFriend ? t("user.friend_removed") : t("user.friend_request_canceled")
    );

  const uiState = useMemo(() => {
    if (isMe) {
      return { mode: "ME" };
    }
    if (isBlocked) {
      return {
        mode: "BLOCKED",
        label: t("user.relation_blocked"),
        subLabel: null,
        variant: "secondary",
        disabled: true,
      };
    }
    if (isFriend) {
      return {
        mode: "FRIEND",
        label: t("user.relation_friend"),
        subLabel: t("user.friend_remove"),
        variant: "primary",
      };
    }
    if (isRequestSent) {
      return {
        mode: "REQUEST_SENT",
        label: t("user.request_sent_label"),
        subLabel: t("user.request_cancel"),
        variant: "secondary",
      };
    }
    if (isRequestReceived) {
      return {
        mode: "REQUEST_RECEIVED",
        label: t("user.request_accept"),
        subLabel: t("user.request_remove"),
        variant: "primary",
      };
    }
    return {
      mode: "NONE",
      label: t("user.add_friend"),
      subLabel: null,
      variant: "primary",
    };
  }, [t, isMe, isBlocked, isFriend, isRequestSent, isRequestReceived]);

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
