// src/realtime/useIdentity.js
import { useMemo } from "react";
import { useSelector } from "react-redux";
import { decodeJwtPayload } from "../utils/jwt";

/**
 * Unified identity for notifications + websocket.
 *
 * Works for BOTH regular users (auth slice) and partners (partnerAuth slice).
 * The notification topic `/topic/users/{id}/notifications` and the notification
 * `recipientId` are keyed by the JWT `id` claim, so we resolve the user id from
 * whichever access token is active (preferring the decoded token claim, which is
 * always the canonical recipient id used by the backend).
 */
export function useIdentity() {
  const authToken = useSelector((s) => s.auth?.accessToken);
  const authUserId = useSelector((s) => s.auth?.user?.id);
  const partnerToken = useSelector((s) => s.partnerAuth?.accessToken);
  const partnerId = useSelector((s) => s.partnerAuth?.partner?.id);

  return useMemo(() => {
    const accessToken = authToken || partnerToken || null;

    let userId = null;
    if (accessToken) {
      const payload = decodeJwtPayload(accessToken);
      if (payload?.id != null) userId = payload.id;
    }
    if (userId == null) userId = authUserId ?? partnerId ?? null;

    return { accessToken, userId: userId != null ? Number(userId) : null };
  }, [authToken, partnerToken, authUserId, partnerId]);
}
